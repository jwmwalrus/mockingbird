import express from 'express';

const app = express();
const port = 3003;

app.listen(port, () => console.info(`Server listening on port ${port}`));

app.set('view engine', 'pug');
app.set('views', 'views');

app.get('/', (req, res) => {
    const payload = {
        pageTitle: 'Home',
    };
    res.status(200).render('home', payload);
});
