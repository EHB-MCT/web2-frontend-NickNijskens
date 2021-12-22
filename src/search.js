window.onload = () => {
  class Drink{
    constructor(id, name, img, instructions, amountOfIngredients, ingredients, measures){
      this.id = id;
      this.name = name;
      this.img = img;
      this.instructions = instructions;
      this.amountOfIngredients = amountOfIngredients;
      this.ingredients = ingredients;
      this.measures = measures;
    }

  }
  let displayedDrinks = []
  let URL = 'https://web2-project-backend-nnijskens.herokuapp.com/api/';
  async function bindSearchEvents(){
    document.getElementById('search-by-name').addEventListener('submit', async () => {
      event.preventDefault();
      displayedDrinks = [];
      let cocktailName = document.getElementById('search-name').value;
      const resp = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${cocktailName}`);
      const data = await resp.json();
      let HTMLstring = "";
      if(data.drinks != null){
        data.drinks.forEach((obj) => {
          let ingredientsArray = [];
          let measuresArray = [];
          for(let i = 1; i <= 15; i++){
            let ingredient = obj[`strIngredient${i}`];
            let measure = obj[`strMeasure${i}`];
            if(ingredient != null && measure != null){
              ingredientsArray.push(ingredient);
              measuresArray.push(measure)
            }
            if(ingredient != null && measure == null){
              ingredientsArray.push(ingredient);
              measuresArray.push("a pinch");
            }
          }
          let drink = new Drink(obj.idDrink, obj.strDrink, obj.strDrinkThumb, obj.strInstructions, ingredientsArray.length, ingredientsArray, measuresArray);
          displayedDrinks.push(drink);
        })
        let even = true;
        displayedDrinks.forEach((obj) => {
          if(even){
            HTMLstring += `<form class="cocktail-catalogue-form blue" id=${obj.id} name="${obj.name}">`;
            even = false;
          }
          else {
            HTMLstring += `<form class="cocktail-catalogue-form green" id=${obj.id} name="${obj.name}">`;
            even = true;
          }
          HTMLstring += `<div class="cocktail-catalogue-img-container">
          <img class="cocktail-catalogue-img" src="${obj.img}">
        </div>
        <div class="cocktail-catalogue-title">${obj.name}</div>
        <div class="cocktail-catalogue-ingredients">`;
        for(let i = 0; i < obj.amountOfIngredients; i++){
          if(i == obj.amountOfIngredients - 1){
            HTMLstring += obj.ingredients[i];
          }
          else {
            HTMLstring += `${obj.ingredients[i]}, `
          }
        }
        HTMLstring += `</div>
        <div class="cocktail-catalogue-price-container">
          <label class="cocktail-catalogue-price-label" for="price${obj.id}">Price €</label>
          <input class="cocktail-catalogue-price" type="number" id="price${obj.id}" value="4">
          <input class="cocktail-catalogue-submit" type="submit" value="Add">
        </div>
      </form>`
        })
      }else {
        HTMLstring = `<div class="empty-catalogue">
        <h4 class="empty-catalogue-text">Please enter valid search terms</h4>
      </div>`
      }

      document.getElementById('cocktail-catalogue').innerHTML = HTMLstring;
      bindAddEvents();
      displayedDrinks.forEach((drink) => {
        cocktailInDatabase(drink.name).then((res) => console.log(res));
      })
    })


    document.getElementById('search-by-ingredient').addEventListener('submit', async () => {
      event.preventDefault();
      let HTMLstring = ``;
      let even = true;
      let cocktailIngredient = document.getElementById('search-ingredient').value;
      const resp = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${cocktailIngredient}`);
      try{
        const data = await resp.json();
        data.drinks.forEach(async (obj) => {
          let ingredientsArray = [];
          let measuresArray = [];
          const drinkResp = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${obj.idDrink}`);
          await drinkResp.json().then((res) => {
            let drink = res.drinks[0];
            for(let i = 1; i <= 15; i++){
              let ingredient = drink[`strIngredient${i}`];
              let measure = drink[`strMeasure${i}`];
              if(ingredient != null && measure != null){
                ingredientsArray.push(ingredient);
                measuresArray.push(measure);
              }
              if(ingredient != null && measure == null){
                ingredientsArray.push(ingredient);
                measuresArray.push("a pinch");
              }
              
            }
            displayedDrinks.push(new Drink(drink.idDrink, drink.strDrink, drink.strDrinkThumb, drink.strInstructions, ingredientsArray.length, ingredientsArray, measuresArray));
            //Generate HTMLstring
            if(even){
              HTMLstring += `<form class="cocktail-catalogue-form blue" id=${drink.idDrink} name="${obj.name}">`
              even = false;
            }
            else {
              HTMLstring += `<form class="cocktail-catalogue-form green" id=${drink.idDrink} name="${obj.name}">`
              even = true;
            }
            HTMLstring += `<div class="cocktail-catalogue-img-container">
            <img class="cocktail-catalogue-img" src=${drink.strDrinkThumb}>
            </div>
            <div class="cocktail-catalogue-title">${drink.strDrink}</div>
            <div class="cocktail-catalogue-ingredients">`;
            for(let i = 0; i < ingredientsArray.length; i++){
              if(i == ingredientsArray.length){
                HTMLstring += ingredientsArray[i];
              }
              else{
                HTMLstring += `${ingredientsArray[i]}, `
              }
            }
            HTMLstring += `</div>
            <div class="cocktail-catalogue-price-container">
            <label class="cocktail-catalogue-price-label" for="price${drink.idDrink}">Price €</label>
            <input class="cocktail-catalogue-price" type="number" id="price${drink.idDrink}" value=4>
            <input class="cocktail-catalogue-submit" type="submit" value="Add">
            </div>
            </form>`;
          });
          // Insert HTMLstring
          document.getElementById('cocktail-catalogue').innerHTML = HTMLstring;
          displayedDrinks.forEach((drink) => {
            cocktailInDatabase(drink.name).then((res) => console.log(res));
          })
          bindAddEvents();
        })
      }
      catch(e){
        HTMLstring = `<div class="empty-catalogue">
        <h4 class="empty-catalogue-text">Please enter valid search terms</h4>
      </div>`
      }
      document.getElementById('cocktail-catalogue').innerHTML = HTMLstring;
    })

  }

  async function bindAddEvents(){
    Array.from(document.getElementsByClassName("cocktail-catalogue-form")).forEach((element) => {
      element.addEventListener('submit', async () => {
        event.preventDefault();
        let id = element.id;
        let drink = displayedDrinks.filter((obj) => {
          if(obj.id == id){
            return obj;
          }
        })[0];
        let price = element[`price${id}`].value;
        cocktailInDatabase(drink.name).then(async (res) => {
          if(!res){
            console.log(drink);
            await fetch(`${URL}cocktails`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                "name": drink.name,
                "img": drink.img,
                "instructions": drink.instructions,
                "ingredients": drink.ingredients,
                "measures": drink.measures,
                "price": price
              })
            })
          }
          else {
            console.log("Already in database");
          }
        })

        drink.ingredients.forEach((ingredient) => {
          ingredientInDatabase(ingredient).then(async (res) => {
            if(!res){
              await fetch(`${URL}drinks`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  "name": ingredient
                })
              })
            }
            else {
              console.log("Already in database");
            }
          })
        })
        
  
      })
    })
  }

  async function ingredientInDatabase(name){
    const resp = await fetch(`${URL}drinks`);
    const data = await resp.json();
    let result = false;
    data.forEach((obj) => {
      if(obj.name == name){
        result = true;
      }
    })
    return await result;
  }

  async function cocktailInDatabase(name){
    const resp = await fetch(`${URL}cocktails`);
    const data = await resp.json();
    let result = false;
    data.forEach((obj) => {
      if(obj.name == name){
        result = true;
      }
    })
    return await result
  }


  bindSearchEvents();
}