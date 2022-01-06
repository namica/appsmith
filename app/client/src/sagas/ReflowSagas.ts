import { setEnableReflow, updateReflowOnBoarding } from "actions/reflowActions";
import {
  ReduxActionErrorTypes,
  ReduxActionTypes,
} from "constants/ReduxActionConstants";
import { User } from "constants/userConstants";
import { isBoolean } from "lodash";
import { widgetReflowOnBoardingState } from "reducers/uiReducers/reflowReducer";
import { all, put, select, takeLatest } from "redux-saga/effects";
import { getCurrentUser } from "selectors/usersSelectors";
import {
  getReflowBetaFlag,
  getReflowOnBoardingFlag,
  setReflowBetaFlag,
} from "utils/storage";

function* initReflowStates() {
  try {
    const user: User = yield select(getCurrentUser);
    const { email } = user;
    if (email) {
      const enableReflow: boolean = yield getReflowBetaFlag(email);
      const enableReflowHasBeenSet = isBoolean(enableReflow);

      yield put(setEnableReflow(enableReflowHasBeenSet ? enableReflow : true));
      if (!enableReflowHasBeenSet) {
        setReflowBetaFlag(email, true);
      }
      const onBoardedState: widgetReflowOnBoardingState = yield getReflowOnBoardingFlag(
        email,
      );
      yield put(
        updateReflowOnBoarding(
          onBoardedState ?? {
            done: false,
            step: -1,
          },
        ),
      );
    }
  } catch (error) {
    yield put({
      type: ReduxActionErrorTypes.REFLOW_BETA_FLAGS_INIT_ERROR,
      payload: {
        error,
      },
    });
  }
}
export default function* reflowSagas() {
  yield all([takeLatest(ReduxActionTypes.INITIALIZE_EDITOR, initReflowStates)]);
}
