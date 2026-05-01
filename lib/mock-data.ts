import type { Borrower, Loan, Payment, Reminder } from "./types";

export const currentUser = {
  id: "user-demo-1",
  name: "Maria Santos",
  email: "maria@example.com"
};

export const borrowers: Borrower[] = [
  {
    id: "borrower-1",
    lenderId: currentUser.id,
    name: "Juan Dela Cruz",
    phone: "+63 917 123 4567",
    email: "juan@example.com",
    notes: "Neighbor. Confirmed contact details in person."
  },
  {
    id: "borrower-2",
    lenderId: currentUser.id,
    name: "Ana Reyes",
    phone: "+63 908 555 0199",
    email: "ana@example.com",
    notes: "Workmate. Uses GCash for payments."
  }
];

export const loans: Loan[] = [
  {
    id: "loan-1",
    lenderId: currentUser.id,
    borrowerId: "borrower-1",
    principal: 5000,
    balance: 3500,
    dueDate: "2026-05-15",
    purpose: "Emergency grocery and bills support",
    status: "partially paid",
    borrowerResponse: "confirmed"
  },
  {
    id: "loan-2",
    lenderId: currentUser.id,
    borrowerId: "borrower-2",
    principal: 2500,
    balance: 2500,
    dueDate: "2026-05-02",
    purpose: "Short-term commute allowance",
    status: "pending confirmation"
  },
  {
    id: "loan-3",
    lenderId: currentUser.id,
    borrowerId: "borrower-1",
    principal: 1800,
    balance: 1800,
    dueDate: "2026-04-20",
    purpose: "Medicine",
    status: "disputed",
    borrowerResponse: "disputed",
    disputeReason: "Borrower says the amount should be PHP 1,300."
  }
];

export const payments: Payment[] = [
  {
    id: "payment-1",
    loanId: "loan-1",
    amount: 1000,
    paidAt: "2026-04-18",
    note: "GCash"
  },
  {
    id: "payment-2",
    loanId: "loan-1",
    amount: 500,
    paidAt: "2026-04-24",
    note: "Cash"
  }
];

export const reminders: Reminder[] = [
  {
    id: "reminder-1",
    loanId: "loan-2",
    channel: "mock",
    message: "Reminder queued. No SMS or email was sent.",
    sentAt: "2026-04-30"
  }
];

export function getBorrower(id: string) {
  return borrowers.find((borrower) => borrower.id === id);
}

export function getLoan(id: string) {
  return loans.find((loan) => loan.id === id);
}

export function formatPeso(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(amount);
}
