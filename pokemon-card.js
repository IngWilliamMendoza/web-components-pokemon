class PokemonCard extends HTMLElement {
    constructor() {
        super();
        
        // Create shadow DOM
        this.attachShadow({ mode: 'open' });
        
        // Clone the template
        const template = document.getElementById('pokemon-card-template');
        const templateContent = template.content.cloneNode(true);
        
        // Add styles to shadow DOM
        const style = document.createElement('style');
        style.textContent = this.getStyles();
        this.shadowRoot.appendChild(style);
        
        // Append content to shadow DOM
        this.shadowRoot.appendChild(templateContent);
        
        // Reference to card content
        this.cardContent = this.shadowRoot.querySelector('.card-content');
    }
    
    // CSS styles for the component
    getStyles() {
        return `
            :host {
                display: block;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .pokemon-card {
                width: 300px;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                background-color: #fff;
                transition: transform 0.3s, box-shadow 0.3s;
                position: relative;
            }

            .pokemon-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }

            .card-header {
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #f7f7f7;
                border-bottom: 1px solid #eee;
            }

            .card-title {
                margin: 0;
                text-transform: capitalize;
                font-size: 1.5rem;
                font-weight: 600;
                color: #333;
            }

            .card-id {
                color: #888;
                font-size: 0.9rem;
            }

            .card-image {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 180px;
                padding: 20px;
                background-color: #f9f9f9;
            }

            .card-image img {
                max-width: 150px;
                max-height: 150px;
                transition: transform 0.3s;
            }

            .pokemon-card:hover .card-image img {
                transform: scale(1.1);
            }

            .card-types {
                display: flex;
                gap: 8px;
                padding: 0 15px;
                margin-top: 10px;
            }

            .type-badge {
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
                color: white;
                text-transform: capitalize;
            }

            .normal { background-color: #A8A77A; }
            .fire { background-color: #EE8130; }
            .water { background-color: #6390F0; }
            .electric { background-color: #F7D02C; }
            .grass { background-color: #7AC74C; }
            .ice { background-color: #96D9D6; }
            .fighting { background-color: #C22E28; }
            .poison { background-color: #A33EA1; }
            .ground { background-color: #E2BF65; }
            .flying { background-color: #A98FF3; }
            .psychic { background-color: #F95587; }
            .bug { background-color: #A6B91A; }
            .rock { background-color: #B6A136; }
            .ghost { background-color: #735797; }
            .dragon { background-color: #6F35FC; }
            .dark { background-color: #705746; }
            .steel { background-color: #B7B7CE; }
            .fairy { background-color: #D685AD; }

            .card-stats {
                padding: 15px;
            }

            .stat-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }

            .stat-name {
                color: #777;
                font-size: 0.9rem;
                text-transform: capitalize;
            }

            .stat-value {
                font-weight: 600;
                color: #333;
            }

            .loading {
                padding: 30px;
                text-align: center;
                color: #888;
            }

            .error {
                padding: 30px;
                text-align: center;
                color: #ff5350;
            }
        `;
    }
    
    // When the element is connected to the DOM
    connectedCallback() {
        const pokemonName = this.getAttribute('pokemon-name');
        if (pokemonName) {
            this.fetchPokemonData(pokemonName);
        }
    }
    
    // When attributes change
    static get observedAttributes() {
        return ['pokemon-name'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'pokemon-name' && newValue !== oldValue) {
            this.fetchPokemonData(newValue);
        }
    }
    
    // Fetch data from Pokemon API
    fetchPokemonData(pokemonName) {
        this.cardContent.innerHTML = '<div class="loading">Loading...</div>';
        
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Pokemon not found');
                }
                return response.json();
            })
            .then(data => this.renderPokemonCard(data))
            .catch(error => {
                this.cardContent.innerHTML = `
                    <div class="error">
                        <p>${error.message}</p>
                        <p>Try a different Pokémon name.</p>
                    </div>
                `;
            });
    }
    
    // Render Pokemon data
    renderPokemonCard(pokemon) {
        // Format Pokemon ID with leading zeros
        const formattedId = '#' + pokemon.id.toString().padStart(3, '0');
        
        // Get sprite URL (prefer official artwork if available)
        const spriteUrl = pokemon.sprites.other['official-artwork'].front_default || 
                          pokemon.sprites.front_default;
        
        // Create HTML for Pokemon types
        const typesHtml = pokemon.types.map(typeInfo => {
            const typeName = typeInfo.type.name;
            return `<span class="type-badge ${typeName}">${typeName}</span>`;
        }).join('');
        
        // Select some stats to display
        const statsToShow = ['hp', 'attack', 'defense', 'speed'];
        const statsHtml = pokemon.stats
            .filter(stat => statsToShow.includes(stat.stat.name))
            .map(stat => `
                <div class="stat-row">
                    <span class="stat-name">${stat.stat.name}</span>
                    <span class="stat-value">${stat.base_stat}</span>
                </div>
            `).join('');
        
        // Build the complete card HTML
        this.cardContent.innerHTML = `
            <div class="card-header">
                <h2 class="card-title">${pokemon.name}</h2>
                <span class="card-id">${formattedId}</span>
            </div>
            <div class="card-image">
                <img src="${spriteUrl}" alt="${pokemon.name}">
            </div>
            <div class="card-types">${typesHtml}</div>
            <div class="card-stats">${statsHtml}</div>
        `;
    }
}

// Register the custom element
customElements.define('pokemon-card', PokemonCard);

// Event listeners for search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('pokemon-search');
    const searchButton = document.getElementById('search-button');
    const cardsContainer = document.getElementById('cards-container');
    
    // Function to handle search
    function searchPokemon() {
        const pokemonName = searchInput.value.trim();
        if (pokemonName) {
            // Create a new pokemon card element
            const pokemonCard = document.createElement('pokemon-card');
            pokemonCard.setAttribute('pokemon-name', pokemonName);
            
            // Add to the container
            cardsContainer.prepend(pokemonCard);
            
            // Clear input
            searchInput.value = '';
        }
    }
    
    // Add event listeners
    searchButton.addEventListener('click', searchPokemon);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchPokemon();
        }
    });
    
    // Load a few default Pokemon on page load
    ['pikachu', 'charizard', 'bulbasaur', 'squirtle'].forEach(name => {
        const card = document.createElement('pokemon-card');
        card.setAttribute('pokemon-name', name);
        cardsContainer.appendChild(card);
    });
});