import axios from 'axios';

const login = async (email, password) => {
  try {
    const response = await axios.post(`${process.env.BACKEND_URL}/auth/login`, { email, password });
    const { access_token, user_type, user } = response.data;
    
    sessionStorage.setItem('token', access_token);
    sessionStorage.setItem('userType', user_type);
    sessionStorage.setItem('userData', JSON.stringify(user));
    
    return { user_type, user };
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};

export const registerAndLogin = async (url, data) => {
  try {
    let registerResponse;
    if (data instanceof FormData) {
      registerResponse = await axios.post(url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      registerResponse = await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (registerResponse.status === 201) {
      // Extraer email y password de los datos enviados
      const email = data instanceof FormData ? data.get('email') : data.email;
      const password = data instanceof FormData ? data.get('password') : data.password;
      
      // Intenta hacer login con las credenciales recién registradas
      return await login(email, password);
    } else {
      throw new Error("Registro fallido");
    }
  } catch (error) {
    console.error("Error en registro o login:", error);
    if (error.response) {
      console.error("Respuesta del servidor:", error.response.data);
    }
    throw error;
  }
};