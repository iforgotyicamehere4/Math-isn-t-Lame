import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { test, expect } from 'vitest';
import Home from '../pages/Home';

test('renders home hero content', () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(
    screen.getByText(/Math isn't lame — it's an adventure!/i)
  ).toBeInTheDocument();
  expect(
    screen.getAllByText(/Sign Up \/ Sign In/i).length
  ).toBeGreaterThan(0);
});
