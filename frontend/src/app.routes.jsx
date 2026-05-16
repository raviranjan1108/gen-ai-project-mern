import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";
import ErrorPage from "./pages/ErrorPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Protected><Home /></Protected>,
        errorElement: <ErrorPage />
    },
    {
        path: "/login",
        element: <Login />,
        errorElement: <ErrorPage />
    },
    {
        path: "/register",
        element: <Register />,
        errorElement: <ErrorPage />
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><Interview /></Protected>,
        errorElement: <ErrorPage />
    }
])