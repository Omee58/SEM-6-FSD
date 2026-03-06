const app = require('./app');

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\nShadiSeva v2 Backend running on http://localhost:${PORT}`);
});
