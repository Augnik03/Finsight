"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/currency-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const { currency, setCurrency, currencySymbol } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold">
            FinSight
          </Link>
          <span className="hidden sm:inline text-sm text-muted-foreground">
            Personal Finance Tracker
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/transactions">Transactions</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/budgets">Budgets</Link>
          </Button>
          <div className="border-l pl-4">
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as "USD" | "INR")}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="mr-2">
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as "USD" | "INR")}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-3 flex flex-col space-y-2">
            <Link 
              href="/" 
              className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/transactions" 
              className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Transactions
            </Link>
            <Link 
              href="/budgets" 
              className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Budgets
            </Link>
          </div>
        </div>
      )}
    </header>
  );
} 