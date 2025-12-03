// shop.js

document.getElementById('addtocart').addEventListener('click', () => {

    var total=localStorage.getItem('checkout');
    total++;
    localStorage.setItem('checkout',total);
    document.querySelector('#checkout').innerHTML=total;
})

