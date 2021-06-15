/* eslint-disable */
export type IAppState = {
    forums: IForum[],
    topics: ITopic[]
}

export const initialState: IAppState = { forums: [], topics: [] }

export type IForum = {
    Id?: number,
    Title: string
    CreatorName: string
    Description: string
    LastTopic?: string
    LastForumId?: number
    LastTopicId?: number
    LastPosterName?: string
    LastPosterEmail?: string
    LastUpdate?: number
    Topics: number
    Posts: number
    Deleted: boolean
    CreatedDate: number
}

export type ForumsAction =
    | { type: 'LOAD_FORUMS', payload: IForum[] }
    | { type: 'UPDATE_FORUM', payload: IForum }
    | { type: 'DELETE_FORUM', payload: IForum }

const forumsReducer: React.Reducer<IForum[], ForumsAction> = (state: IForum[], action: ForumsAction) => {
    switch (action.type) {
        case 'LOAD_FORUMS':
            return action.payload
        case 'UPDATE_FORUM':
            return [...state.map(forum => forum.Id === action.payload.Id ? { ...forum, ...action.payload } : forum)]
        case 'DELETE_FORUM':
            return [...state.filter(forum => forum.Id !== action.payload.Id)]
        default:
            return state
    }
}

export type ITopic = {
    Id?: number
    Title: string
    Description: string
    Message?: string
    ForumId: number
    CreatorName: string
    CreatorEmail: string
    LastPosterName: string
    LastPosterEmail: string
    LastUpdate: number
    Views: number
    Replies: number
    CreatedDate: number
}

export type TopicsAction =
    | { type: 'LOAD_TOPICS', payload: ITopic[] }
    | { type: 'UPDATE_TOPIC', payload: ITopic }
    | { type: 'DELETE_TOPIC', payload: ITopic }

const topicsReducer: React.Reducer<ITopic[], TopicsAction> = (state: ITopic[], action: TopicsAction) => {
    switch (action.type) {
        case 'LOAD_TOPICS':
            return action.payload
        case 'UPDATE_TOPIC':
            return [...state.map(topic => topic.Id === action.payload.Id ? { ...topic, ...action.payload } : topic)]
        case 'DELETE_TOPIC':
            return [...state.filter(forum => forum.Id !== action.payload.Id)]
        default:
            return state
    }
}

const appReducer: React.Reducer<IAppState, any> = (state: IAppState, action) => ({
    forums: forumsReducer(state.forums, action),
    topics: topicsReducer(state.topics, action)
})

export default appReducer