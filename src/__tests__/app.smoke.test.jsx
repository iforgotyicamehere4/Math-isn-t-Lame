import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { test, expect } from 'vitest';
import App from '../App';

test('renders game page shell', () => {
  render(
    <MemoryRouter initialEntries={['/game']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText('Math Pup')).toBeInTheDocument();
  expect(screen.getByText('Start')).toBeInTheDocument();
  expect(screen.getByText('Pause')).toBeInTheDocument();
});
