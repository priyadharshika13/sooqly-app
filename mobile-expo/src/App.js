import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

const API_BASE = process.env.API_BASE || "http://10.0.2.2:8000";

export default function App(){
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [cart, setCart] = useState([]);
  const [token, setToken] = useState(null);

  const load = async () => {
    const res = await axios.get(`${API_BASE}/products/`, { params:{ q } });
    setProducts(res.data);
  };
  useEffect(()=>{ load(); }, [q]);

  const add = (p) => {
    const existing = cart.find(ci => ci.product_id === p.id);
    if(existing){
      setCart(cart.map(ci => ci.product_id === p.id ? { ...ci, qty: ci.qty+1 } : ci));
    } else {
      setCart([...cart, { product_id: p.id, name: p.name, price: p.price, qty: 1 }]);
    }
  };

  const registerAnon = async () => {
    const rand = Math.floor(Math.random()*999999);
    const res = await axios.post(`${API_BASE}/auth/register`, {
      email: `guest${rand}@sooqly.app`, password: "Guest@123"
    });
    setToken(res.data.access_token);
  };

  const placeOrder = async () => {
    if(!token) await registerAnon();
    const t = token || (await (await axios.post(`${API_BASE}/auth/login`, new URLSearchParams({username:`admin@sooqly.app`, password:`Admin@123`}))).data.access_token);
    const totalQty = cart.reduce((a,b)=>a+b.qty,0);
    if(totalQty===0){ Alert.alert("Cart empty"); return; }
    const res = await axios.post(`${API_BASE}/orders/`, { items: cart.map(c=>({product_id:c.product_id, qty:c.qty})) }, {
      headers: { Authorization: `Bearer ${t}` }
    });
    Alert.alert("Order placed", `Order #${res.data.id} • ₹${res.data.total_amount.toFixed(2)}`);
    setCart([]);
  };

  return (
    <SafeAreaView style={{flex:1, padding:16}}>
      <Text style={{fontSize:22, fontWeight:'700'}}>Sooqly</Text>
      <TextInput placeholder="Search..." value={q} onChangeText={setQ} style={{borderWidth:1, padding:8, borderRadius:8, marginVertical:12}} />
      <FlatList
        data={products}
        keyExtractor={item=>String(item.id)}
        renderItem={({item}) => (
          <View style={{padding:12, borderWidth:1, borderRadius:12, marginBottom:8}}>
            <Text style={{fontSize:16, fontWeight:'600'}}>{item.name}</Text>
            <Text>₹ {item.price}</Text>
            <TouchableOpacity onPress={()=>add(item)} style={{marginTop:8, padding:10, borderRadius:8, backgroundColor:'#2e7d32'}}>
              <Text style={{color:'#fff', textAlign:'center'}}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity onPress={placeOrder} style={{padding:14, borderRadius:10, backgroundColor:'#1565c0'}}>
        <Text style={{color:'#fff', textAlign:'center'}}>Checkout ({cart.reduce((a,b)=>a+b.qty,0)})</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
