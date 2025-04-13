import { AuthProvider } from './AuthContext';
import { ProductProvider } from './ProductContext';
import { CategoryProvider } from './CategoryContext';
import { UserProvider } from './UserContext';
export const ContextWrapper = ({ children }) => {
    return (
        <AuthProvider>
            <CategoryProvider>
                <UserProvider>
                <ProductProvider>
                    {children}
                </ProductProvider>
                </UserProvider>
            </CategoryProvider>
        </AuthProvider>
    );
};
