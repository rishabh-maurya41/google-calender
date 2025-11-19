import { CalendarProvider } from './context';
import { ErrorBoundary, WeekView, NotificationContainer } from './components';
import './App.css';

function CalendarContent() {
  return (
    <div className="app">
      <div className="app-container">
        <main className="app-main">
          <WeekView />
        </main>
      </div>
      <NotificationContainer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <CalendarProvider>
        <CalendarContent />
      </CalendarProvider>
    </ErrorBoundary>
  );
}

export default App;
