import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [product, setProduct] = useState({
    productName: "",
    price: "",
    quantity: "",
  });

  const [ingredient, setIngredient] = useState({
    ingredientName: "",
    price: "",
    quantity: "",
  });

  // -------- FETCH INVENTORY --------
  useEffect(() => {
    async function fetchInventory() {
      try {
        const [prodRes, ingRes] = await Promise.all([
          api.get("/products"),
          api.get("/ingredients"),
        ]);

        setProducts(prodRes.data.products || []);
        setIngredients(ingRes.data.ingredients || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  // -------- CREATE PRODUCT --------
  async function createProduct(e) {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.post("/products", {
        productName: product.productName,
        price: Number(product.price),
        quantity: Number(product.quantity),
      });

      setProducts((prev) => [...prev, res.data.product]);
      setProduct({ productName: "", price: "", quantity: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Product creation failed");
    }
  }

  // -------- CREATE INGREDIENT --------
  async function createIngredient(e) {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.post("/ingredients", {
        ingredientName: ingredient.ingredientName,
        price: Number(ingredient.price),
        quantity: Number(ingredient.quantity),
      });

      setIngredients((prev) => [...prev, res.data.ingredient]);
      setIngredient({ ingredientName: "", price: "", quantity: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Ingredient creation failed");
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Products</h2>
      <form onSubmit={createProduct}>
        <input
          placeholder="Name"
          value={product.productName}
          onChange={(e) =>
            setProduct({ ...product, productName: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Price"
          value={product.price}
          onChange={(e) =>
            setProduct({ ...product, price: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Quantity"
          value={product.quantity}
          onChange={(e) =>
            setProduct({ ...product, quantity: e.target.value })
          }
        />
        <button>Add Product</button>
      </form>

      <ul>
        {products.map((p) => (
          <li key={p._id}>
            {p.productName} — {p.quantity} — ${p.price}
          </li>
        ))}
      </ul>

      <h2>Ingredients</h2>
      <form onSubmit={createIngredient}>
        <input
          placeholder="Name"
          value={ingredient.ingredientName}
          onChange={(e) =>
            setIngredient({
              ...ingredient,
              ingredientName: e.target.value,
            })
          }
        />
        <input
          type="number"
          placeholder="Price"
          value={ingredient.price}
          onChange={(e) =>
            setIngredient({ ...ingredient, price: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Quantity"
          value={ingredient.quantity}
          onChange={(e) =>
            setIngredient({ ...ingredient, quantity: e.target.value })
          }
        />
        <button>Add Ingredient</button>
      </form>

      <ul>
        {ingredients.map((i) => (
          <li key={i._id}>
            {i.ingredientName} — {i.quantity} — ${i.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
