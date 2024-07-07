import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Api Calling
export const GetQuestion = createAsyncThunk(
    'GetQuestionsData',
    async (userdata, thunkAPI) => {
        try {
            let result = await axios({
                method: 'GET', url: `https://opentdb.com/api.php?amount=10`, headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (result.data) {
                return result.data.results.map(que => ({
                    question: que.question,
                    options: [que.correct_answer, ...que.incorrect_answers].sort(() => Math.random() - 0.5),
                    correctAnswer: que.correct_answer,
                    type: que.type,
                }));
            }
            else {
                return thunkAPI.rejectWithValue(result.data);
            }
        } catch (error) {
            let errorMessage = error.response !== undefined ? error.response : error.message
            return thunkAPI.rejectWithValue({ error: errorMessage });
        }
    }
);

// Define Initial State.
const initialState = {
    questions: [],
    status: 'idle',
    index: 0,
    currentQuestion: null,
    answer: null,
    answers: [],
    correctCount: 0,
    wrongCount: 0
}
// Create Slice 
export const questionsSlice = createSlice({

    name: 'question',
    initialState,
    reducers: {
        newAnswer: (state, action) => {
            const { payload } = action;
            if (!payload) return;
            const isCorrect = payload === state.currentQuestion.correctAnswer;
            state.answers.push({
                question: state.currentQuestion,
                answer: payload,
                isCorrect
            });
            if (isCorrect) {
                state.correctCount += 1;
            } else {
                state.wrongCount += 1;
            }
            state.answer = payload;
        },
        nextQuestion: (state) => {
            if (state.index < state.questions.length - 1) {
                state.index += 1;
                state.currentQuestion = state.questions[state.index];
                state.answer = null;
            }
        },
        resetQuiz: (state) => {
            state.index = 0;
            state.currentQuestion = state.questions[0];
            state.answer = null;
            state.answers = [];
            state.correctCount = 0;
            state.wrongCount = 0;
        },
    },

    extraReducers: (builder) => {

        builder.addCase(GetQuestion.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.questions = action.payload;
            state.currentQuestion = action.payload[0];
        })
        builder.addCase(GetQuestion.rejected, (state) => {
            state.status = 'failed'
        })
        builder.addCase(GetQuestion.pending, (state) => {
            state.status = 'loading'
        })
    }
})
export const { newAnswer, nextQuestion, resetQuiz } = questionsSlice.actions
export default questionsSlice.reducer
