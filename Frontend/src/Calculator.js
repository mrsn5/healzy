var API = require('./API');
var Templates = require('./Templates');
var Storage = require('./LocalStorage');

var Product_List=[];
var allProducts=[];
var sum=
    {
        mass: parseFloat(0),
        proteins:parseFloat(0),
        fats: parseFloat(0),
        carbs: parseFloat(0),
        calories: parseFloat(0)
    }
;
var sumPer100g=
    {
        mass: parseFloat(100),
        proteins:parseFloat(0),
        fats: parseFloat(0),
        carbs: parseFloat(0),
        calories: parseFloat(0)
    }
;
var counter;

var $inputProduct =$('#automplete');
var $inputMass =$('#massInput');

function addOneProduct(product, mass) {
    counter++;
    var html_code_normal = Templates.Product_Normal_OneItem({product: product, mass: mass, counter:counter});
    var $node_normal = $(html_code_normal);

    var html_code_small = Templates.Product_Small_OneItem({product: product, mass: mass, counter:counter});
    var $node_small = $(html_code_small);
    $('#table_small').append($node_small);
    $('#table_normal').append($node_normal);


    Product_List.push(new WrappedProduct(product, mass));
    Product_List.forEach(calculateSum);

    updateList();
}
function removeFromList(wrappedProduct) {
    sum.mass-=wrappedProduct.mass;
    sum.proteins-=(wrappedProduct.product.proteins * wrappedProduct.mass * 0.01).toFixed(2);
    sum.fats-=(wrappedProduct.product.fats * wrappedProduct.mass * 0.01).toFixed(2);
    sum.carbs-=(wrappedProduct.product.carbs * wrappedProduct.mass * 0.01).toFixed(2);
    sum.calories-=(wrappedProduct.product.calories * wrappedProduct.mass * 0.01).toFixed(2);

    sumPer100g.proteins-=wrappedProduct.product.proteins;
    sumPer100g.fats-=wrappedProduct.product.fats;
    sumPer100g.carbs-=wrappedProduct.product.carbs;
    sumPer100g.calories-=wrappedProduct.product.calories;

    Product_List.splice(Product_List.indexOf(wrappedProduct),1);
    updateList();
}

function calculateSum(wrappedProduct){
    sum.mass= parseFloat(sum.mass) +  parseFloat(wrappedProduct.mass);
    sum.proteins= parseFloat(sum.proteins)   +  parseFloat(wrappedProduct.product.proteins * wrappedProduct.mass * 0.01).toFixed(2);
    sum.fats= parseFloat(sum.fats)   + parseFloat(wrappedProduct.product.fats * wrappedProduct.mass * 0.01).toFixed(2);
    sum.carbs= parseFloat(sum.carbs)   + parseFloat(wrappedProduct.product.carbs * wrappedProduct.mass * 0.01).toFixed(2);
    sum.calories= parseFloat(sum.calories)   + parseFloat(wrappedProduct.product.calories * wrappedProduct.mass * 0.01).toFixed(2);

    sumPer100g.proteins=parseFloat(sumPer100g.proteins) +parseFloat(wrappedProduct.product.proteins);
    sumPer100g.fats=parseFloat(sumPer100g.fats) + parseFloat(wrappedProduct.product.fats);
    sumPer100g.carbs=parseFloat(sumPer100g.carbs) + parseFloat(wrappedProduct.product.carbs);
    sumPer100g.calories=parseFloat(sumPer100g.calories) + parseFloat(wrappedProduct.product.calories);
}

function updateList(){

    $('#table_small').html("");
    $('#table_normal').html("");
    counter=0;

    function showOnePizzaInCart(wrappedProduct) {
        counter++;

        var html_code_normal = Templates.Product_Normal_OneItem({product: wrappedProduct.product, mass: wrappedProduct.mass, counter:counter});
        var $node_normal = $(html_code_normal);

        var html_code_small = Templates.Product_Small_OneItem({product: wrappedProduct.product, mass: wrappedProduct.mass, counter:counter});
        var $node_small = $(html_code_small);

        $node_small.find(".td__remove").click(function(){
            removeFromList(wrappedProduct);
        });
        $node_normal.find(".td__remove").click(function(){
            removeFromList(wrappedProduct);
        });
        $('#table_small').append($node_small);
        $('#table_normal').append($node_normal);
    }

    Storage.set("list",	Product_List);

    Product_List.forEach(showOnePizzaInCart);


    $('.weight_total').text(sum.mass);
    $('.proteins_total').text(sum.proteins);
    $('.fats_total').text(sum.fats);
    $('.carbs_total').text(sum.carbs);
    $('.cals_total').text(sum.calories);

    $('.proteins_total_hundr').text(sumPer100g.proteins);
    $('.fats_total_hundr').text(sumPer100g.fats);
    $('.carbs_total_hundr').text(sumPer100g.carbs);
    $('.cals_total_hundr').text(sumPer100g.calories);
}



function initCalc() {
    allProducts =[];
    var titles=[];
    counter=0;

    API.findProduct({title: ""}, function (err, res) {
        if(err)
            alert("Can't load product list");
        else{
            allProducts=res;
            for(var i=0;i<allProducts.length;i++)
                titles.push(allProducts[i].title);

            $inputProduct.autocomplete({
                minLength:2,
                delay:100,
                source: titles
            });
        }
    });

    var saved_products = Storage.get("list");
    if (saved_products) {
        Product_List = saved_products;
        Product_List.forEach(calculateSum);
    }
    updateList();
}

$(".addProduct").click(function () {
    if($inputProduct.val().trim()!=="" && $inputMass.val().trim()!==""){
        for(i=0; i<allProducts.length; i++){
            if($inputProduct.val().trim()===allProducts[i].title){
                addOneProduct(allProducts[i],$inputMass.val());
                $inputProduct.val("");
                $inputMass.val("");
            }
        }
    }
});
function WrappedProduct(product, mass) {
    this.product = product;
    this.mass = mass;
}

exports.initCalc = initCalc;