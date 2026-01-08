import {
    useDispatch,
    useSelector,
    type TypedUseSelectorHook,
} from "react-redux";

import { AppDispatch, RootState } from "app/reducers";

export { reactPlayerActions } from 'app/reducers/reactPlayerReducer';
export { selectionActions } from 'app/reducers/selectionReducer';
export { timelineActions } from 'app/reducers/timelineReducer'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;