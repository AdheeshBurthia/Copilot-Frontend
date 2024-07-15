import React, { useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";

const App = () => {
  const queryClient = useQueryClient();
  const [backendData, setBackendData] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    quantity: "",
    active: true,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // useEffect(() => {
  //   fetch("http://localhost:5000/products")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setBackendData(data);
  //     });
  // }, []);

  const { data, error, isLoading, isPending, isSuccess } = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      fetch("http://localhost:5000/products").then((res) => res.json()),
  });

  const { mutate } = useMutation({
    mutationFn: async (newProduct) =>
      await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(newProduct),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEditing
      ? `http://localhost:5000/products/${formData.id}`
      : "http://localhost:5000/products";
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
        return response.json();
      })
      .then((data) => {
        if (isEditing) {
          setBackendData((prevData) =>
            prevData.map((product) =>
              product.id === formData.id ? data.product : product
            )
          );
          setIsEditing(false);
        } else {
          setBackendData((prevData) => [...prevData, data]);
        }
        setFormData({
          id: "",
          name: "",
          price: "",
          quantity: "",
          active: true,
        });
        setErrorMessage("");
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  const handleEdit = (product) => {
    setFormData(product);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/products/${id}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
        setBackendData((prevData) =>
          prevData.filter((product) => product.id !== id)
        );
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  return (
    <div>
      {isPending && <p>Product is being added...</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Status:</label>
          <select
            name="active"
            value={formData.active}
            onChange={handleChange}
            required
          >
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </select>
        </div>
        <button type="submit">
          {isEditing ? "Update Product" : "Add Product"}
        </button>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </form>

      {/* {backendData.length === 0
        ? "Loading..."
        : backendData.map((product, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <p>---------------------------</p>
              <p>ID: {product.id}</p>
              <p>Name: {product.name}</p>
              <p>Price: ${product.price}</p>
              <p>Quantity: {product.quantity}</p>
              <p>Status: {product.active ? "Active" : "Inactive"}</p>
              <button onClick={() => handleEdit(product)}>Edit</button>
              <button onClick={() => handleDelete(product.id)}>Delete</button>
            </div>
          ))} */}

      {data.map((product, i) => (
        <div key={i} style={{ marginBottom: "10px" }}>
          <p>---------------------------</p>
          <p>ID: {product.id}</p>
          <p>Name: {product.name}</p>
          <p>Price: ${product.price}</p>
          <p>Quantity: {product.quantity}</p>
          <p>Status: {product.active ? "Active" : "Inactive"}</p>
          <button onClick={() => handleEdit(product)}>Edit</button>
          <button onClick={() => handleDelete(product.id)}>Delete</button>
        </div>
      ))}
      {/* Using useMutation to handle form */}
      <button
        onClick={() =>
          mutate({
            name: "New Product",
            price: 100,
            quantity: 10,
            active: true,
          })
        }
      >
        Add New Product
      </button>
    </div>
  );
};

export default App;
