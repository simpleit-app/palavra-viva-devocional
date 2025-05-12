
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from './UserAvatar';
import { Moon, Sun, Menu, X, UserCircle, BookOpen, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/components/ui/use-toast';

const NavBar: React.FC = () => {
  const { currentUser, signOut, isPro } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  if (!currentUser) return null;

  // Include Achievements for all users
  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Home' },
      { path: '/study-route', label: 'Rota de Estudo' },
      { path: '/reflections', label: 'Reflexões' },
      { path: '/achievements', label: 'Conquistas' },
    ];
    
    return baseItems;
  };

  const navItems = getNavItems();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // After signOut, navigate to login page
      navigate('/login');
      toast({
        title: "Logout realizado",
        description: "Você saiu da aplicação com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível fazer logout. Tente novamente.",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">Palavra Viva</span>
          {!isPro && <span className="text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">Free</span>}
          {isPro && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Pro</span>}
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.path 
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <UserAvatar user={currentUser} showLevel={false} size="sm" />
              <span className="text-sm font-medium hidden md:inline-block">
                {currentUser.name.split(' ')[0]}
              </span>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          {/* Mobile menu button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] pt-12">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserAvatar user={currentUser} showLevel={true} size="md" />
                    <div>
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2 rounded-md text-base font-medium transition-colors ${
                        location.pathname === item.path 
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  <Link
                    to="/profile"
                    className={`px-4 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === '/profile' 
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      Meu Perfil
                    </div>
                  </Link>
                </nav>
                
                <div className="mt-auto pt-6">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2" 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
