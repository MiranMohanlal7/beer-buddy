import axios from "axios";

const API_URL = "http://localhost:5151/api/drinks";

export const getDrinks = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
