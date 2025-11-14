import { useEffect, useState } from "react";
import { getDrinks } from "../services/drinkService";

export default function DrinkList() {
  const [drinks, setDrinks] = useState([]);

  useEffect(() => {
    getDrinks().then(setDrinks);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Drinks</h1>

      {drinks.map((d: any) => (
        <div key={d.id} style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <img src={d.imageUrl} width={50} />
          <div>
            <strong>{d.name}</strong>
            <p>Quantity: {d.quantity}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
