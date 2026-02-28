const apiToken = import.meta.env.VITE_API_TOKEN;
const apiURL = import.meta.env.VITE_API_URL;

export const apiPaymentsCreateIntent = async (paymentMethodId, amount, uid) => {
  const data = { paymentMethodId, amount, uid };
  const url = apiURL.concat("payments/create-intent");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiToken,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
