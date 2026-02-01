import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductsAPI, ReviewsAPI } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { money } from "../state";

export default function ProductDetails() {
  const { id } = useParams();
  const { add } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    const p = await ProductsAPI.get(id);
    setProduct(p.product);
    const r = await ReviewsAPI.listForProduct(id);
    setReviews(r.reviews);
  };

  useEffect(() => { load(); }, [id]);

  const onAddReview = async () => {
    setErr("");
    try {
      await ReviewsAPI.add({ productId: id, rating, comment });
      setComment("");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add review (maybe you already reviewed this product)");
    }
  };

  if (!product) return <div className="container"><div className="card">Loading...</div></div>;

  return (
    <div className="container">
      <div className="card">
        <div className="row row--space">
          <div>
            <h2>{product.name}</h2>
            <div className="muted">productId: {product._id}</div>
            <div className="muted">sellerId: {product.sellerId?._id || product.sellerId}</div>
          </div>
          <div className="right">
            <div className="price">${money(product.price)}</div>
            <div className="pill">Stock: {product.stock}</div>
            <div className="pill">Rating: {product.ratingAvg} ({product.ratingCount})</div>
          </div>
        </div>

        <div className="row">
          <button className="btn" disabled={!user || product.stock <= 0} onClick={() => add(product, 1)}>
            Add to cart
          </button>
          {!user && <span className="muted">Login to buy and review.</span>}
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Reviews</h3>
          {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
          {reviews.map(rv => (
            <div key={rv._id} className="review">
              <div className="row row--space">
                <div className="chip">{rv.userId?.name || "User"} · {rv.rating}/5</div>
                <div className="muted small">{new Date(rv.createdAt).toLocaleString()}</div>
              </div>
              <div>{rv.comment || <span className="muted">No comment</span>}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Leave a review</h3>
          {err && <div className="alert alert--error">{err}</div>}
          <div className="form">
            <label>Rating</label>
            <select value={rating} onChange={e => setRating(Number(e.target.value))} disabled={!user}>
              {[5,4,3,2,1].map(x => <option key={x} value={x}>{x}</option>)}
            </select>

            <label>Comment</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write something..." disabled={!user} />

            <button className="btn" onClick={onAddReview} disabled={!user}>Submit review</button>
            {!user && <p className="muted">Login required.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
