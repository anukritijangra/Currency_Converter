// Using ExchangeRate-API (free, no API key needed for basic functionality)
const BASE_URL = "https://open.er-api.com/v6/latest";
const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");

// Populate dropdowns with currency options
for (let select of dropdowns) {
  for (const currCode in countryList) {
    let newOption = document.createElement("option");
    newOption.innerText = currCode;
    newOption.value = currCode;
    if (select.name === "from" && currCode === "USD") {
      newOption.selected = "selected";
    } else if (select.name === "to" && currCode === "INR") {
      newOption.selected = "selected";
    }
    select.append(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

const updateExchangeRate = async () => {
  let amount = document.querySelector(".amount input");
  let amtVal = amount.value;
  if (amtVal === "" || amtVal < 1) {
    amtVal = 1;
    amount.value = "1";
  }
  
  // Show loading state
  msg.innerText = "Getting exchange rate...";
  
  try {
    // Get exchange rates with the base currency
    const URL = `${BASE_URL}/${fromCurr.value}`;
    const response = await fetch(URL);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    if (data.result === "success") {
      // Get the conversion rate for the target currency
      const rate = data.rates[toCurr.value];
      const finalAmount = (amtVal * rate).toFixed(2);
      msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
    } else {
      throw new Error('API returned an unsuccessful result');
    }
  } catch (error) {
    // Fallback to another API if the first one fails
    try {
      const fallbackURL = `https://api.exchangerate.host/convert?from=${fromCurr.value}&to=${toCurr.value}&amount=${amtVal}`;
      const fallbackResponse = await fetch(fallbackURL);
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData.success) {
        const finalAmount = fallbackData.result.toFixed(2);
        msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
      } else {
        throw new Error('Fallback API also failed');
      }
    } catch (fallbackError) {
      msg.innerText = "Error fetching exchange rates. Please try again later.";
      console.error("Exchange rate API errors:", error, fallbackError);
    }
  }
};

const updateFlag = (element) => {
  const currCode = element.value;
  const countryCode = countryList[currCode];
  const newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  const img = element.parentElement.querySelector("img");
  img.src = newSrc;
};

btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

window.addEventListener("load", () => {
  updateExchangeRate();
});