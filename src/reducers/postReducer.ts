export type IPost = {
    Id?: number
    Title: string
    Content: string
    ForumId: number
    TopicId: number
    PosterName: string
    PosterEmail: string
    Answered: boolean
    CreatedDate: number
}

export type PostsAction =
    | { type: 'LOAD_POSTS', payload: IPost[] }
    | { type: 'UPDATE_POST', payload: IPost }
    | { type: 'DELETE_POST', payload: IPost }

const postsReducer: React.Reducer<IPost[], PostsAction> = (state: IPost[], action: PostsAction) => {
    switch (action.type) {
        case 'LOAD_POSTS':
            return [...state, ...action.payload]
        case 'UPDATE_POST':
            return [...state.map(post => post.Id === action.payload.Id ? { ...post, ...action.payload } : post)]
        case 'DELETE_POST':
            return [...state.filter(post => post.Id !== action.payload.Id)]
        default: {
            return state
        }
    }
}

export default postsReducer