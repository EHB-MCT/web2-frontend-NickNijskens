window.onload = () => {
  let URL = 'https://web2-project-backend-nnijskens.herokuapp.com/api/'
  
  async function getStock(){
    const resp = await fetch(URL + 'drinks');
    const data = await resp.json();
    let HTMLstring = "";
    let even = true;
    data.forEach((obj) => {
      if(even){
        HTMLstring += `<form class="stock-form blue" id="${obj._id}">`
        even = false;
      }
      else {
        HTMLstring += `<form class="stock-form green" id="${obj._id}">`
        even = true;
      }
      HTMLstring += `<div class="stock-title">${obj.name}</div>
      <div class="stock-amount-container" name="stock-amount-container">
      <label class="stock-amount-label" for="stock${obj._id}">Amount: </label>
      <input class="stock-amount-number" type="number" id="stock${obj._id}" value=${obj.stock}>
      <input class="stock-amount-submit" type="submit" value="Change">
      </div>
      </form>`
    });

    document.getElementById("stock").innerHTML = HTMLstring;
    bindStockEvents();
  }

  function bindStockEvents(){
    Array.from(document.getElementsByClassName("stock-form")).forEach((obj) => {
      obj.addEventListener('submit', async function() {
        event.preventDefault();
        let newStock = obj[`stock${obj.id}`].value;
        await fetch(URL + 'drinks/' + obj.id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "value": newStock
          })
        })
        getStock();
      })
    })
  }

  getStock();
}