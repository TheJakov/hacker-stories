import React from 'react';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {

  const useSemiPersistentState = (key, initialState) => {
    const [value, setValue] = React.useState(
      localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
      localStorage.setItem(key, value);
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
      case 'STORIES_FETCH_SUCCES':
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

  const handleFetchStories = React.useCallback(() => {
    if(!searchTerm) return;

    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    fetch(url)
    .then(response => response.json())
    .then(result => {
      dispatchStories({
        type: 'STORIES_FETCH_SUCCES',
        payload: result.hits,
      });
    })
    .catch(() => dispatchStories({ type: 'STORIES_FETCH_FAILURE'})
    );
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

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  };

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel 
        id="search" 
        isFocused 
        value={searchTerm} 
        onInputChange={handleSearchInput}
      > 
        <strong>Search: </strong>
      </InputWithLabel>

      <button
        type="button"
        disabled={!searchTerm}
        onClick={handleSearchSubmit}
      >
        Submit
      </button>

      <hr />

      { stories.isError && <p>Something went wrong ...</p> }

      { stories.isLoading 
      ? ( <p>Loading ...</p> )
      : ( <List list={stories.data} onRemoveItem={handleRemoveStory} /> )
      }
      
    </div>
  );
}

const InputWithLabel = ({ id, value, type='text', onInputChange, isFocused, children }) => {

  const inputRef = React.useRef();

  React.useEffect( () => {
    if(isFocused && inputRef.current){
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input id={id} ref={inputRef} type={type} value={value} onChange={onInputChange} />
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
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <br />
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </div>
  )
};

export default App;
