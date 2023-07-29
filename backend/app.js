const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { SERVER_PORT, DB } = require('./utils/config');
const usersRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { createUser, login, logout } = require('./controllers/users');
const { auth } = require('./middlewares/auth');
const { errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const { validateUser, validateLogin } = require('./middlewares/validations');
const errorHandler = require('./middlewares/error-handler');
const NotFoundError = require('./errors/not-found-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('cors');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

mongoose.connect(DB);

app.use(cookieParser());
app.use(helmet());
app.use(bodyParser.json());
app.use(requestLogger);
app.use(limiter);
app.use(cors({ origin: ['http://localhost:3000', 'https://mesto.student.project.nomoredomains.xyz', 'http://mesto.student.project.nomoredomains.xyz'], credentials: true, maxAge: 36 }));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signup', validateUser, createUser);
app.post('/signin', validateLogin, login);
app.delete('/logout', logout);
app.use(auth);

app.use('/users', usersRouter);
app.use('/cards', cardRouter);

app.use(errorLogger);
app.use((req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});
app.use(errors());
app.use(errorHandler);

app.listen(SERVER_PORT);