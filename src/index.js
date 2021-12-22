window.onload = () => {
  let URL = 'https://web2-project-backend-nnijskens.herokuapp.com/api/'
  async function getCocktails(){
    const resp = await fetch(URL + 'cocktails');
    const data = await resp.json();
    let HTMLstring = "";
    let even = true;
    data.forEach((obj) => {
      HTMLstring += `<div class="flex-cocktail-container">`;
      if(even){
        HTMLstring += `<div class="flex-cocktail blue">`;
        even = false;
      } else {
        HTMLstring += `<div class="flex-cocktail green">`;
        even = true;
      }
      HTMLstring += `<h6 class="cocktail-card-title">${obj.name}</h6>
      <div class="cocktail-card-content">
      <img class="cocktail-img" src="${obj.img}">
      <ul class="cocktail-card-ingredients">`

      let iter = 0;
      obj.ingredients.forEach((ingredient) => {
        HTMLstring += `<li><p class="cocktail-ingredient">${ingredient}: ${obj.measures[iter]}</p></li>`;
        iter++;
      })

      HTMLstring += `</ul>
      <p class="cocktail-card-instructions">${obj.instructions}</p>
     </div>
     <input type="button" class="delete-cocktail" value="Remove" id=${obj._id}>
     <input type="button" class="make-cocktail" value="Make" id=${obj._id}>
    </div>
    
    <span class="cocktail-price"><p class="cocktail-price-text">€${obj.price}</p></span>
  </div>`
    });
    document.getElementById("cocktails").innerHTML = HTMLstring;

    bindCocktailEvents();
  }

  function bindCocktailEvents(){
    Array.from(document.getElementsByClassName("make-cocktail")).forEach((obj) => {
      obj.addEventListener('click', async function() {
        const resp = await fetch(URL + 'cocktails/' + obj.id);
        const cocktail = await resp.json();
        const drinks = await fetch(URL + 'drinks');
        const stock = await drinks.json();
        stock.forEach((drink) => {
          cocktail.ingredients.forEach(async function(ingredient){
            if(ingredient == drink.name){
              let newStock = drink.stock - 1;
              await fetch(`${URL}drinks/${drink._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  "value": newStock
                })
              })
            }
          })
        })
      })
    })

    Array.from(document.getElementsByClassName("delete-cocktail")).forEach((obj) => {
      obj.addEventListener('click', async function(){
        await fetch(`${URL}cocktails/${obj.id}`, {
          method: "DELETE"
        });
        getCocktails();
      })
    })
  }

  getCocktails();


}