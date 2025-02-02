import React from 'react';
import axios from 'axios';

import {ReactComponent as Check} from './check.svg';
import styles from './App.module.css';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {

  const useSemiPersistentState = (key, initialState) => {
    const isMounted = React.useRef(false);

    const [value, setValue] = React.useState(
      localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
      if(!isMounted.current){
        isMounted.current = true;
      } else {
        console.log('A');
        localStorage.setItem(key, value);
      }
    }, [value, key]);

    return [value, setValue];
};

  const storiesReducer = (state, action) => {
    switch(action.type) {
      case 'STORIES_FETCH_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case 'STORIES_FETCH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case 'STORIES_FETCH_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      case 'REMOVE_STORY':
        return {
          ...state,
          data: state.data.filter(
            story => action.payload.objectID !== story.objectID
          ),
        };
      default:
        throw new Error();
    }
  };

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer, {data: [], isLoading: false, isError: false }
  );

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({type: 'STORIES_FETCH_FAILURE' });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My Hacker Stories</h1>
      
      <SearchForm 
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      { stories.isError && <p>Something went wrong ...</p> }

      { stories.isLoading 
      ? ( <p>Loading ...</p> )
      : ( <List list={stories.data} onRemoveItem={handleRemoveStory} /> )
      }
      
    </div>
  );
}

const SearchForm = (
  {
    searchTerm,
    onSearchInput,
    onSearchSubmit
  }
  ) => (
    <form onSubmit={onSearchSubmit} className={styles.searchForm}>
        <InputWithLabel 
          id="search" 
          isFocused 
          value={searchTerm} 
          onInputChange={onSearchInput}
        > 
          <strong>Search: </strong>
        </InputWithLabel>

        <button type="submit" disabled={!searchTerm} className={`${styles.button} ${styles.buttonLarge}`} >
          Submit
        </button>
      </form>
  );

const InputWithLabel = ({ id, value, type='text', onInputChange, isFocused, children }) => {

  const inputRef = React.useRef();

  React.useEffect( () => {
    if(isFocused && inputRef.current){
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id} className={styles.label}>{children}</label>
      &nbsp;
      <input id={id} ref={inputRef} type={type} value={value} onChange={onInputChange} className={styles.input} />
    </>
  );
};

// Definition of List component
const List = ({ list, onRemoveItem }) => 
  list.map(item => 
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
);

const Item = ({ item, onRemoveItem }) => {
  return(
    <div className={ styles.item }>
      <span style={{width: '40%' }}>
        <a href={item.url}>{item.title}</a>
      </span>
      <br />
      <span style={{ width: '30%' }}>{item.author}</span>
      <span style={{ width: '10%' }}>{item.num_comments}</span>
      <span style={{ width: '10%' }}>{item.points}</span>
      <span style={{ width: '10%' }}>
        <button type="button" onClick={() => onRemoveItem(item)} className={`${styles.button} ${styles.buttonSmall}`}>
          <Check height="18px" width="18px" />
        </button>
      </span>
    </div>
  )
};

export default App;
