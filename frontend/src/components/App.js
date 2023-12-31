import '../index.css';
import Main from './Main.js';
import Footer from './Footer.js';
import Login from './Login.js';
import Register from './Register.js';
import React, { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import ProtectedRouteElement from './ProtectedRoute.js';
import PopupWithForm from './PopupWithForm';
import ImagePopup from './ImagePopup.js';
import EditProfilePopup from './EditProfilePopup.js';
import { AddPlacePopup } from './AddPlacePopup.js';
import { EditAvatarPopup } from './EditAvatarPopup.js';
import { api } from '../utils/Api.js';
import { CurrentUserContext } from '../contexts/CurrentUserContext.js';
import { checkToken, authorize, register } from '../utils/Auth.js';
import InfoTooltip from './InfoTooltip.js';

function App() {

  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState('');
  const [isRegisterSuccess, setIsRegisterSuccess] = React.useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState({ onOpen: false, card: {} });
  const [currentUser, setCurrentUser] = React.useState({});
  const [loggedIn, setLoggedIn] = React.useState(false);
  const navigate = useNavigate();

  function handleNavigate() {
    navigate('/sign-in', { replace: true });
    closeAllPopups();
  }
 
  React.useEffect(() => {
    const handleTokenCheck = () => {
      const jwt = localStorage.getItem('userId');
      if (jwt) {
        checkToken(jwt)
          .then((res) => {
            if (res) {
              setUserEmail(res.email);
              setLoggedIn(true);
              navigate('/', { replace: true });
              getMainPage();
            }
          })
          .catch(err => console.log(err));
      }
    }
    handleTokenCheck();
  }, [])

  function getMainPage() {
    Promise.all([api.getUserInfo(), api.getCardsInfo()])
      .then(([{ name, about, avatar, _id }, cards]) => {
        setCards(cards);
        setCurrentUser({ name, about, avatar, _id })
      }).catch((err) => {
        console.log(err);
      });
  }

  function handleLogin(password, email) {
    authorize(password, email)
      .then((data) => {
        if (data.token) {
          setUserEmail(email);
          navigate('/', { replace: true });
          setLoggedIn(true);
          getMainPage();
        }
      })
      .catch(() => {
        setIsRegisterPopupOpen(true);
        setIsRegisterSuccess(false);
      });
  }

  function handleRegister(password, email) {
    register(password, email)
      .then((res) => {
        if (res) {
          handleRegisterSubmitClick();
          setIsRegisterSuccess(true);
          setIsRegisterPopupOpen(true);
        }
      })
      .catch(() => {
        handleRegisterSubmitClick();
        setIsRegisterSuccess(false);
        setIsRegisterPopupOpen(true);
      });
  }

  function signOut() {
    localStorage.removeItem('userId');
    api.logout();
    navigate('/sign-in', { replace: true });
  }

  function handleUpdateUser(formData) {
    setIsLoading(true);
    api.patchUserInfo(formData)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleUpdateAvatar(formData) {
    setIsLoading(true);
    api.patchAvatar(formData)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleAddCard(formData) {
    setIsLoading(true);
    api.createCard(formData)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i === currentUser._id);

    if (isLiked) {
      api.deleteLike(card._id, !isLiked)
        .then((newCard) => {
          setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
        }).catch((err) => {
          console.log(err);
        });
    } else {
      api.putLike(card._id, !isLiked)
        .then((newCard) => {
          setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
        }).catch((err) => {
          console.log(err);
        });
    }
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then(() => {
        setCards((state) => state.filter((c) => c._id !== card._id));
      }).catch((err) => {
        console.log(err);
      });
  }

  function handleEscClose(evt) {
    if (evt.key === 'Escape') {
      closeAllPopups();
    }
  }

  function handleRegisterSubmitClick() {
    setIsRegisterPopupOpen(true);
    document.addEventListener('keydown', handleEscClose);
  }

  function handleCardClick(card) {
    setSelectedCard({ isOpen: true, card: card });
    document.addEventListener('keydown', handleEscClose);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
    document.addEventListener('keydown', handleEscClose);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
    document.addEventListener('keydown', handleEscClose);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
    document.addEventListener('keydown', handleEscClose);
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsRegisterPopupOpen(false);
    setSelectedCard({ isOpen: false, card: {} });
    document.removeEventListener('keydown', handleEscClose);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className='root'>
        <InfoTooltip isOpen={isRegisterPopupOpen} isRegister={isRegisterSuccess} onClose={closeAllPopups} onNavigate={handleNavigate} />
        <EditProfilePopup isLoading={isLoading} onUpdateUser={handleUpdateUser} isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} />
        <AddPlacePopup isLoading={isLoading} onAddCard={handleAddCard} isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} />
        <ImagePopup
          card={selectedCard}
          onClose={closeAllPopups} />
        <PopupWithForm
          name='popup-delete-card'
          title='Вы уверены?'
          buttonText='Да'
          onClose={closeAllPopups} />
        <EditAvatarPopup isLoading={isLoading} onUpdateAvatar={handleUpdateAvatar} isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} />
        <Routes>
          <Route path="/" element={
            <ProtectedRouteElement
              element={Main}
              loggedIn={loggedIn}
              onEditAvatar={handleEditAvatarClick}
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onCardClick={handleCardClick}
              onCardLike={handleCardLike}
              onCardDelete={handleCardDelete}
              cards={cards}
              onSignOut={signOut}
              email={userEmail} />} />
          <Route path="/sign-in" element={<Login onLogin={handleLogin} onNavigate={handleNavigate} />} />
          <Route path="/sign-up" element={<Register onRegister={handleRegister} onNavigate={handleNavigate} />} />
        </Routes>
        <Footer />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;