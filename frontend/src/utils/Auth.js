const BASE_URL = 'http://localhost:3001';

export const register = (password, email) => {
    return fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Acccept': 'application/json',
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ password, email })
    })
        .then(checkResponse)
};

export const authorize = (password, email) => {
    return fetch(`${BASE_URL}/signin`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ password, email })
    })
        .then(checkResponse)
        .then((data) => {
            localStorage.setItem('userId', data._id);
            return data;
        })
};

export const checkToken = () => {
    return fetch(`${BASE_URL}/users/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            'Accept': 'application/json'
        }
    })
        .then(checkResponse)
}

function checkResponse(res) {
    if (res.ok) {
        return res.json()
    }
    return Promise.reject(`Ошибка: ${res.status}`)
}