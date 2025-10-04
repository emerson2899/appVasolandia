export const api = axios.create({
  baseURL: 'https://api.example.com'
});

api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    return Promise.reject(error);
  }
);

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (url, options) => {
    setLoading(true);
    try {
      const response = await api.request({ url, ...options });
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error);
      throw error;
    }
  };

  return { request, loading, error };
};
