import React, { useState, useEffect } from 'react';
import { TextField, Button, Tab, Tabs, Typography, Container, Grid, Paper, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const MoneyTracker = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(1000); // Example budget

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      const expensesData = JSON.parse(localStorage.getItem('expenses')) || [];
      setExpenses(expensesData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAddExpense = (description, amount) => {
    const newExpense = {
      id: Date.now(),
      description,
      amount,
      date: new Date(),
      category: categorizeTransaction(description),
    };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  const handleDeleteExpense = (id) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  const categorizeTransaction = (description) => {
    const categories = {
      'groceries': ['supermarket', 'grocery', 'food'],
      'utilities': ['electricity', 'water', 'gas', 'internet'],
      'entertainment': ['cinema', 'restaurant', 'bar'],
      // Add more categories and keywords
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        return category;
      }
    }

    return 'other';
  };

  useEffect(() => {
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    if (totalExpenses > budget * 0.9) {
      alert("You're nearing your budget limit!");
    }
  }, [expenses, budget]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4">Money Tracker</Typography>
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        <Tab label="Personal" value="personal" />
        <Tab label="Business" value="business" />
      </Tabs>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h6">Add Expense</Typography>
            <TextField label="Description" fullWidth />
            <TextField label="Amount" type="number" fullWidth />
            <Button onClick={() => handleAddExpense('Sample Description', 100)}>Add</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h6">Expenses</Typography>
            {expenses.map(expense => (
              <div key={expense.id}>
                <Typography>{expense.description} - ${expense.amount}</Typography>
                <Button onClick={() => handleDeleteExpense(expense.id)}>Delete</Button>
              </div>
            ))}
          </Paper>
        </Grid>
      </Grid>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={expenses}>
          <XAxis dataKey="description" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Container>
  );
};

export default MoneyTracker;
