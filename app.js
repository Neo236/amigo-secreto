/**
 * Amigo Secreto - App Logic
 */

(() => {
    // --- State ---
    let friendsList = [];

    // --- DOM Elements ---
    const elements = {
        inputName: document.getElementById('amigo'),
        btnAdd: document.querySelector('.button-add'),
        btnDraw: document.querySelector('.button-draw'),
        listContainer: document.getElementById('listaAmigos'),
        resultContainer: document.getElementById('resultado'),
    };

    // --- Pure Functions ---
    
    /**
     * Checks if a name is valid (contains at least one letter,
     * including accented characters and ñ).
     * @param {string} name
     * @returns {boolean}
     */
    const isValidName = (name) => /\p{L}/u.test(name);
    
    /**
     * Checks if a name already exists in the list (case-insensitive).
     * @param {string} name 
     * @param {string[]} list 
     * @returns {boolean}
     */
    const isDuplicate = (name, list) => 
        list.some(item => item.toLowerCase() === name.toLowerCase());

    /**
     * Shuffles an array using the Fisher-Yates algorithm.
     * @param {any[]} array 
     * @returns {any[]} A new shuffled array.
     */
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    /**
     * Generates Secret Santa pairs from a shuffled array.
     * @param {string[]} shuffledList 
     * @returns {Object[]} Array of { giver, receiver } objects.
     */
    const generatePairs = (shuffledList) => {
        return shuffledList.map((giver, index) => {
            const receiver = shuffledList[(index + 1) % shuffledList.length];
            return { giver, receiver };
        });
    };

    // --- UI & DOM Functions ---

    /**
     * Displays a temporary toast message.
     * @param {string} message 
     */
    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Trigger reflow for animation
        void toast.offsetWidth; 
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    /**
     * Creates falling confetti elements.
     */
    const createConfetti = () => {
        for (let i = 0; i < 70; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    };

    /**
     * Toggles the disabled state of interactive UI elements.
     * @param {boolean} isDisabled 
     */
    const toggleUI = (isDisabled) => {
        elements.inputName.disabled = isDisabled;
        elements.btnAdd.disabled = isDisabled;
        elements.btnDraw.disabled = isDisabled;
        
        if (!isDisabled) {
            elements.inputName.focus();
        }
    };

    /**
     * Renders the list of friends, each with a remove button.
     * @param {string[]} friends
     */
    const renderFriendsList = (friends) => {
        elements.listContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();

        friends.forEach(friend => {
            const li = document.createElement('li');

            const span = document.createElement('span');
            span.textContent = friend;
            li.appendChild(span);

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'button-remove';
            removeBtn.textContent = '✕';
            removeBtn.setAttribute('aria-label', `Eliminar a ${friend} de la lista`);
            removeBtn.addEventListener('click', () => handleRemoveFriend(friend));
            li.appendChild(removeBtn);

            fragment.appendChild(li);
        });

        elements.listContainer.appendChild(fragment);
    };

    /**
     * Renders the Secret Santa pairs with an animation delay.
     * @param {Object[]} pairs 
     */
    const renderResults = (pairs) => {
        elements.resultContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();

        pairs.forEach((pair, index) => {
            const li = document.createElement('li');
            
            li.textContent = `${pair.giver} le regala a `;
            
            const strong = document.createElement('strong');
            strong.textContent = pair.receiver;
            li.appendChild(strong);
            
            li.style.animationDelay = `${index * 0.2}s`;
            li.classList.add('result-item-anim');
            
            fragment.appendChild(li);
        });

        elements.resultContainer.appendChild(fragment);
    };

    // --- Event Handlers ---

    const handleAddFriend = () => {
        const name = elements.inputName.value.trim();

        if (!name) {
            showToast("Por favor, inserte un nombre.");
            elements.inputName.value = '';
            elements.inputName.focus();
            return;
        }

        if (!isValidName(name)) {
            showToast("Por favor, inserte un nombre válido (letras requeridas).");
            return;
        }

        if (isDuplicate(name, friendsList)) {
            showToast("Este nombre ya ha sido agregado. Por favor, inserte un nombre diferente.");
            elements.inputName.value = '';
            elements.inputName.focus();
            return;
        }

        // State update
        friendsList = [...friendsList, name];
        
        // UI updates
        renderFriendsList(friendsList);
        elements.resultContainer.innerHTML = '';
        
        elements.inputName.value = '';
        elements.inputName.focus();
    };

    const handleRemoveFriend = (name) => {
        friendsList = friendsList.filter(friend => friend !== name);
        renderFriendsList(friendsList);
        elements.resultContainer.innerHTML = '';
        elements.inputName.focus();
    };

    const handleDraw = () => {
        if (friendsList.length < 2) {
            showToast("Debes agregar al menos 2 amigos para realizar el sorteo.");
            return;
        }

        // Disable UI during calculation and animation
        toggleUI(true);

        const shuffled = shuffleArray(friendsList);
        const pairs = generatePairs(shuffled);
        
        renderResults(pairs);
        createConfetti();
        
        // Calculate total animation time to re-enable UI (pairs.length * 200ms + padding)
        const animationTime = (pairs.length * 200) + 1500;
        
        setTimeout(() => {
            toggleUI(false);
        }, animationTime);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!elements.btnAdd.disabled) {
                handleAddFriend();
            }
        }
    };

    // --- Initialization ---

    const init = () => {
        elements.btnAdd.addEventListener('click', handleAddFriend);
        elements.inputName.addEventListener('keydown', handleKeyDown);
        elements.btnDraw.addEventListener('click', handleDraw);
    };

    // Start application
    init();
})();
