import { Outlet } from 'react-router-dom';

export default function ExamLayout() {
  return (
    <div className="exam-shell">
      <div className="exam-content">
        <Outlet />
      </div>
    </div>
  );
}
