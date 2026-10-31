const STORAGE_KEY = "prismMarketHubDemo_v1";
const seedProducts = [
 {id:"p1",name:"Wireless Bluetooth Headphones",price:1850,category:"Electronics",description:"Comfortable everyday headphones with wireless connectivity.",seller:"Tech Corner",emoji:"🎧"},
 {id:"p2",name:"Classic White Sneakers",price:2400,category:"Fashion",description:"Versatile casual sneakers for everyday outfits.",seller:"Urban Steps",emoji:"👟"},
 {id:"p3",name:"Stainless Steel Water Bottle",price:850,category:"Home",description:"Reusable bottle for school, work and travel.",seller:"Home Finds",emoji:"🥤"},
 {id:"p4",name:"Everyday Skincare Set",price:1650,category:"Beauty",description:"A simple skincare set for your daily routine.",seller:"Glow Store",emoji:"🧴"},
 {id:"p5",name:"Football Training Ball",price:1200,category:"Sports",description:"A durable ball for practice and recreation.",seller:"Active Sports",emoji:"⚽"},
 {id:"p6",name:"Mini Desk Lamp",price:1350,category:"Home",description:"Compact lamp for your reading or study table.",seller:"Bright Living",emoji:"💡"},
 {id:"p7",name:"Canvas Shoulder Bag",price:1100,category:"Fashion",description:"Lightweight everyday bag with a roomy interior.",seller:"Mtaa Styles",emoji:"👜"},
 {id:"p8",name:"Portable Power Bank",price:2200,category:"Electronics",description:"Extra power when you are away from a socket.",seller:"Tech Corner",emoji:"🔋"}
];
let state = loadState();
let toastTimer;
function loadState(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(saved&&Array.isArray(saved.products)&&Array.isArray(saved.cart)&&Array.isArray(saved.orders))return saved;}catch(e){}return{products:seedProducts,cart:[],orders:[]};}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function money(n){return "KSh "+Number(n||0).toLocaleString("en-KE");}
function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function showToast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2400);}
function cartCount(){return state.cart.reduce((sum,item)=>sum+item.qty,0);}
function cartTotal(){return state.cart.reduce((sum,item)=>{const p=state.products.find(x=>x.id===item.id);return sum+(p?p.price*item.qty:0);},0);}
function renderProducts(){
 const query=document.getElementById("searchInput").value.trim().toLowerCase(),category=document.getElementById("categoryFilter").value,sort=document.getElementById("sortFilter").value;
 let products=state.products.filter(p=>(category==="All"||p.category===category)&&[p.name,p.description,p.seller,p.category].join(" ").toLowerCase().includes(query));
 if(sort==="low")products.sort((a,b)=>a.price-b.price);if(sort==="high")products.sort((a,b)=>b.price-a.price);
 document.getElementById("productTotal").textContent=`${products.length} product${products.length===1?"":"s"}`;
 document.getElementById("emptyState").classList.toggle("hidden",products.length>0);
 document.getElementById("productGrid").innerHTML=products.map(p=>`<article class="product-card"><div class="product-image">${p.image?`<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" onerror="this.remove()">`:`<span>${p.emoji||"📦"}</span>`}</div><div class="product-info"><span class="product-category">${escapeHTML(p.category)}</span><h3 title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description||"Discover this item from a local seller.")}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" data-add="${escapeHTML(p.id)}">＋ Add</button></div><div class="seller-name">Sold by ${escapeHTML(p.seller)}</div></div></article>`).join("");
 document.querySelectorAll("[data-add]").forEach(btn=>btn.addEventListener("click",()=>addToCart(btn.dataset.add)));
}
function addToCart(id){const product=state.products.find(p=>p.id===id);if(!product)return;const item=state.cart.find(x=>x.id===id);if(item)item.qty++;else state.cart.push({id,qty:1});save();renderCart();showToast("Added to your basket");}
function renderCart(){
 document.getElementById("cartCount").textContent=cartCount();document.getElementById("cartSubtotal").textContent=money(cartTotal());
 document.getElementById("checkoutTotal").textContent=money(cartTotal());
 const wrap=document.getElementById("cartItems");
 if(!state.cart.length){wrap.innerHTML='<div class="empty-state">Your basket is empty. Explore the marketplace and add something you like.</div>';}
 else wrap.innerHTML=state.cart.map(item=>{const p=state.products.find(x=>x.id===item.id);if(!p)return"";return`<div class="cart-item"><div class="cart-thumb">${p.emoji||"📦"}</div><div><b>${escapeHTML(p.name)}</b><small>${money(p.price)} each</small><div class="quantity"><button data-qty="${p.id}" data-delta="-1">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div><b>${money(p.price*item.qty)}</b></div>`;}).join("");
 wrap.querySelectorAll("[data-qty]").forEach(btn=>btn.addEventListener("click",()=>{const item=state.cart.find(x=>x.id===btn.dataset.qty);if(!item)return;item.qty+=Number(btn.dataset.delta);if(item.qty<=0)state.cart=state.cart.filter(x=>x.id!==btn.dataset.qty);save();renderCart();renderStats();});
}
function openCart(){document.getElementById("cartDrawer").classList.add("open");document.getElementById("cartDrawer").setAttribute("aria-hidden","false");document.getElementById("drawerBackdrop").classList.remove("hidden");}
function closeCart(){document.getElementById("cartDrawer").classList.remove("open");document.getElementById("cartDrawer").setAttribute("aria-hidden","true");document.getElementById("drawerBackdrop").classList.add("hidden");}
function renderStats(){
 const custom=state.products.filter(p=>p.custom),total=state.orders.reduce((n,o)=>n+o.total,0);
 document.getElementById("sellerListings").textContent=custom.length;document.getElementById("sellerCartItems").textContent=cartCount();document.getElementById("sellerOrders").textContent=state.orders.length;
 document.getElementById("adminProducts").textContent=state.products.length;document.getElementById("adminOrders").textContent=state.orders.length;document.getElementById("adminValue").textContent=money(total);
 document.getElementById("adminList").innerHTML=state.products.map(p=>`<div class="admin-row"><div><b>${escapeHTML(p.name)}</b><br><span>${escapeHTML(p.seller)} • ${money(p.price)}</span></div><button class="delete-btn" data-delete="${escapeHTML(p.id)}">Remove</button></div>`).join("");
 document.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{state.products=state.products.filter(p=>p.id!==btn.dataset.delete);state.cart=state.cart.filter(x=>x.id!==btn.dataset.delete);save();renderAll();showToast("Demo listing removed");}));
}
function renderAll(){renderProducts();renderCart();renderStats();}
document.getElementById("productForm").addEventListener("submit",e=>{
 e.preventDefault();const data=new FormData(e.currentTarget);const name=String(data.get("name")).trim(),price=Number(data.get("price")),seller=String(data.get("seller")).trim();
 if(!name||!seller||!Number.isFinite(price)||price<=0){showToast("Please enter valid product details");return;}
 state.products.unshift({id:"user-"+Date.now(),name,price,category:String(data.get("category")),description:String(data.get("description")).trim(),image:String(data.get("image")).trim(),seller,emoji:"📦",custom:true});
 save();e.currentTarget.reset();renderAll();showToast("Your demo listing is now visible in this browser");document.getElementById("products").scrollIntoView({behavior:"smooth"});
});
document.getElementById("searchInput").addEventListener("input",renderProducts);document.getElementById("categoryFilter").addEventListener("change",renderProducts);document.getElementById("sortFilter").addEventListener("change",renderProducts);
document.getElementById("cartButton").addEventListener("click",openCart);document.getElementById("closeCart").addEventListener("click",closeCart);document.getElementById("drawerBackdrop").addEventListener("click",closeCart);
document.getElementById("checkoutButton").addEventListener("click",()=>{if(!state.cart.length){showToast("Your basket is empty");return;}document.getElementById("checkoutDialog").showModal();});
document.getElementById("closeCheckout").addEventListener("click",()=>document.getElementById("checkoutDialog").close());
document.getElementById("checkoutForm").addEventListener("submit",e=>{
 e.preventDefault();if(!state.cart.length)return;const data=new FormData(e.currentTarget);const order={id:"ORD-"+Date.now(),customer:String(data.get("customer")),phone:String(data.get("phone")),location:String(data.get("location")),payment:String(data.get("payment")),items:state.cart.map(x=>({...x})),total:cartTotal(),created:new Date().toISOString()};
 state.orders.push(order);state.cart=[];save();e.currentTarget.reset();document.getElementById("checkoutDialog").close();closeCart();renderAll();showToast("Demo order placed! No payment was taken.");
});
document.getElementById("resetButton").addEventListener("click",()=>{if(confirm("Reset all demo products, cart and orders?")){state={products:seedProducts,cart:[],orders:[]};save();renderAll();showToast("Demo data reset");}});
document.getElementById("menuButton").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("show"));
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>{document.querySelectorAll(".nav a").forEach(x=>x.classList.remove("active"));a.classList.add("active");document.getElementById("mainNav").classList.remove("show");}));
document.getElementById("year").textContent=new Date().getFullYear();
renderAll();
