
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Loader2, CreditCard, TagIcon } from 'lucide-react';

interface SubscriptionUpgradeProps {
  variant?: 'default' | 'inline' | 'card';
  showFeatures?: boolean;
  className?: string;
}

const SubscriptionUpgrade: React.FC<SubscriptionUpgradeProps> = ({ 
  variant = 'default',
  showFeatures = true,
  className = ''
}) => {
  const { currentUser, refreshSubscription, isPro } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [portalLoading, setPortalLoading] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState('');
  const [couponError, setCouponError] = React.useState('');

  const handleUpgrade = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setCouponError('');
    
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: couponCode ? { couponCode } : undefined,
        method: 'POST',
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Não foi possível criar o checkout");
      }
      
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      
      // Check if the error is related to the coupon code
      if (error.message?.includes('coupon')) {
        setCouponError('Cupom inválido ou expirado');
        toast({
          variant: "destructive",
          title: "Erro no cupom",
          description: error.message || "O cupom informado é inválido ou expirado.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao iniciar checkout",
          description: error.message || "Ocorreu um erro ao iniciar o checkout. Tente novamente mais tarde.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!currentUser || !isPro) return;
    
    setPortalLoading(true);
    
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Não foi possível acessar o portal do cliente");
      }
      
    } catch (error: any) {
      console.error("Error accessing customer portal:", error);
      toast({
        variant: "destructive",
        title: "Erro ao acessar portal",
        description: error.message || "Ocorreu um erro ao acessar o portal de gerenciamento. Tente novamente mais tarde.",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  // Coupon input field component
  const CouponInput = () => {
    if (isPro) return null;
    
    return (
      <div className="space-y-2 mb-4">
        <Label htmlFor="coupon-code">Possui um cupom?</Label>
        <div className="flex items-center gap-2">
          <Input
            id="coupon-code"
            placeholder="Digite o código do cupom"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setCouponError('');
            }}
            className={couponError ? "border-destructive" : ""}
          />
        </div>
        {couponError && (
          <p className="text-xs text-destructive">{couponError}</p>
        )}
      </div>
    );
  };

  // For inline variant, render just a button
  if (variant === 'inline') {
    return (
      <div className={`w-full space-y-2 ${className}`}>
        {!isPro && (
          <CouponInput />
        )}
        
        <Button 
          onClick={handleUpgrade} 
          disabled={loading || isPro}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : isPro ? (
            "Você já possui o Plano Pro"
          ) : (
            "Atualizar para o Plano Pro"
          )}
        </Button>

        {isPro && (
          <Button 
            variant="outline"
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="w-full"
          >
            {portalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Acessando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Gerenciar assinatura
              </>
            )}
          </Button>
        )}
      </div>
    );
  }
  
  // For card variant, render a full card with features
  if (variant === 'card') {
    return (
      <Card className={`${isPro ? "border-primary/40 bg-primary/5" : ""} ${className}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Plano Pro</CardTitle>
              <CardDescription>Desbloqueie todos os recursos</CardDescription>
            </div>
            {isPro && <Badge>Seu Plano Atual</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className="text-3xl font-bold">R$19,90</span>
            <span className="text-muted-foreground">/mês</span>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Acesso ilimitado à todos os textos bíblicos</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Reflexões ilimitadas</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Acesso ao menu de Conquistas</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Recursos futuros exclusivos</span>
            </li>
          </ul>
          
          {!isPro && (
            <CouponInput />
          )}
          
          {isPro && currentUser?.subscriptionEnd && (
            <Alert className="mb-4">
              <AlertDescription>
                Sua assinatura está ativa até {new Date(currentUser.subscriptionEnd).toLocaleDateString('pt-BR')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={handleUpgrade}
            disabled={loading || isPro}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : isPro ? (
              "Você já possui o Plano Pro"
            ) : (
              "Assinar agora"
            )}
          </Button>

          {isPro && (
            <Button 
              variant="outline"
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="w-full"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Acessando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Gerenciar assinatura
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  // Default variant with optional features
  return (
    <div className={`p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Plano Pro</h3>
          <p className="text-muted-foreground">Apenas R$19,90/mês</p>
        </div>
        {isPro && <Badge>Seu Plano Atual</Badge>}
      </div>
      
      {showFeatures && (
        <ul className="space-y-2 mb-4">
          <li className="flex items-start text-sm">
            <span className="mr-2">✓</span>
            <span>Acesso ilimitado à todos os textos bíblicos</span>
          </li>
          <li className="flex items-start text-sm">
            <span className="mr-2">✓</span>
            <span>Reflexões ilimitadas</span>
          </li>
          <li className="flex items-start text-sm">
            <span className="mr-2">✓</span>
            <span>Acesso ao menu de Conquistas</span>
          </li>
        </ul>
      )}
      
      {!isPro && (
        <CouponInput />
      )}
      
      <div className="space-y-2">
        <Button 
          onClick={handleUpgrade}
          disabled={loading || isPro}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : isPro ? (
            "Você já possui o Plano Pro"
          ) : (
            "Atualizar para o Plano Pro"
          )}
        </Button>
        
        {isPro && (
          <Button 
            variant="outline"
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="w-full"
          >
            {portalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Acessando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Gerenciar assinatura
              </>
            )}
          </Button>
        )}
      </div>
      
      {isPro && currentUser?.subscriptionEnd && (
        <p className="text-xs text-center mt-2 text-muted-foreground">
          Sua assinatura está ativa até {new Date(currentUser.subscriptionEnd).toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  );
};

export default SubscriptionUpgrade;
