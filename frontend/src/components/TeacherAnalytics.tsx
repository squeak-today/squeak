import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAPI } from '../hooks/useTeacherAPI';
import NavPage from '../components/NavPage';
import styled from 'styled-components';
import {
  Section,
  DateHeader,
  AnalyticsContainer,
  Widget,
  WidgetHeader,
  WidgetContent,
} from '../styles/TeacherDashboardPageStyles';
import { FaClock, FaChartPie, FaCommentDots, FaExclamationTriangle } from 'react-icons/fa';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  TooltipProps
} from 'recharts';

// Modified layout to have better spacing and organization
const AnalyticsPageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

// Updated AnalyticsGrid for new layout
const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

// Row for two widgets side by side
const WidgetRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
`;

// Fix the styled component to properly type the props
interface PercentageIndicatorProps {
  $value: number; // Use $ prefix for transient props
}

const PercentageIndicator = styled.span<PercentageIndicatorProps>`
  color: ${props => props.$value >= 80 ? '#4caf50' : props.$value >= 60 ? '#ff9800' : '#f44336'};
  font-weight: bold;
`;

const ProblemItem = styled.div`
  padding: 10px;
  margin-bottom: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 4px solid #f44336;
`;

const ProblemRank = styled.span`
  font-weight: bold;
  margin-right: 8px;
`;

// Define interfaces for data types
interface TimeSpentDataItem {
  week: string;
  timeSpent: number;
}

interface ProblemArea {
  id: number;
  question: string;
  incorrectRate: number;
}

interface PerformanceData {
  score: number;
  previousScore: number;
  change: string;
  problemAreas: ProblemArea[];
}

interface WordAnalyticsItem {
  name: string;
  value: number;
}

interface LearningProgressItem {
  category: string;
  mastered: number;
  struggling: number;
}

interface NavPageProps {
  children: React.ReactNode;
  isLoading: boolean;
  subtitle?: string;
}

// Updated NavPage with correct prop types
const EnhancedNavPage: React.FC<NavPageProps & { title: string }> = ({ children, ...props }) => (
  <NavPage {...props}>{children}</NavPage>
);

function TeacherAnalytics() {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);
  const {
    isAuthenticated,
    verifyTeacher,
  } = useTeacherAPI();

  // Mock time spent data (weekly)
  const timeSpentData: TimeSpentDataItem[] = [
    { week: 'Week 1', timeSpent: 4.2 },
    { week: 'Week 2', timeSpent: 5.0 },
    { week: 'Week 3', timeSpent: 3.8 },
    { week: 'Week 4', timeSpent: 7.0 },
  ];

  // Mock performance data
  const performanceData: PerformanceData = {
    score: 75,
    previousScore: 68,
    change: '+7%',
    problemAreas: [
      { id: 1, question: "Compound word recognition", incorrectRate: 42 },
      { id: 2, question: "Silent letter identification", incorrectRate: 35 },
      { id: 3, question: "Consonant blends", incorrectRate: 28 },
    ]
  };

  // Mock word analytics data
  const wordAnalyticsData: WordAnalyticsItem[] = [
    { name: 'Sounded Out', value: 150 },
    { name: 'Recognized', value: 200 },
    { name: 'Skipped', value: 50 },
  ];

  // Learning progress data
  const learningProgressData: LearningProgressItem[] = [
    { category: 'Vowels', mastered: 85, struggling: 15 },
    { category: 'Consonants', mastered: 92, struggling: 8 },
    { category: 'Blends', mastered: 65, struggling: 35 },
    { category: 'Digraphs', mastered: 58, struggling: 42 },
    { category: 'Sight Words', mastered: 78, struggling: 22 },
  ];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  useEffect(() => {
    if (!isInitializing) return;
    const init = async () => {
      try {
        if (isAuthenticated) {
          const data = await verifyTeacher();
          if (!data.exists) {
            navigate('/teacher/become');
          }
        }
      } catch (error) {
        console.error('Error verifying teacher:', error);
        navigate('/teacher/become');
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [verifyTeacher, navigate, isAuthenticated, isInitializing]);

  // Custom formatter for Line Chart tooltip
  const timeSpentFormatter = (value: number | string | Array<number | string>) => {
    if (typeof value === 'number') {
      return [`${value} hours`, 'Time Spent'];
    }
    return ['', ''];
  };

  // Custom formatter for Pie Chart tooltip
  const wordAnalyticsFormatter = (value: number | string | Array<number | string>) => {
    if (typeof value === 'number') {
      return [value, 'Words'];
    }
    return ['', ''];
  };

  // Custom formatter for Bar Chart tooltip
  const learningProgressFormatter = (value: number | string | Array<number | string>, name: string) => {
    if (typeof value === 'number') {
      return [
        `${value}%`,
        name === 'mastered' ? 'Mastered' : 'Needs Help'
      ];
    }
    return ['', ''];
  };

  // Custom label renderer for Pie chart
  const renderCustomizedLabel = (props: any) => {
    const { name, percent } = props;
    if (name && typeof percent === 'number') {
      return `${name}: ${(percent * 100).toFixed(0)}%`;
    }
    return '';
  };

  return (
    <EnhancedNavPage title="Classroom Analytics" isLoading={isInitializing}>
      <AnalyticsPageContainer>
        <DateHeader>Last Updated: {new Date().toLocaleDateString()}</DateHeader>
        
        <AnalyticsGrid>
          {/* Row 1: Time Spent and Performance side by side */}
          <WidgetRow>
            {/* Time Spent Widget */}
            <Widget>
              <WidgetHeader>
                <FaClock />
                <h3>Time Spent</h3>
              </WidgetHeader>
              <WidgetContent>
                <MetricValue>{timeSpentData.reduce((acc, curr) => acc + curr.timeSpent, 0).toFixed(1)} hours total</MetricValue>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timeSpentData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={timeSpentFormatter} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="timeSpent" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </WidgetContent>
            </Widget>

            {/* Performance Widget */}
            <Widget>
              <WidgetHeader>
                <FaChartPie />
                <h3>Performance</h3>
              </WidgetHeader>
              <WidgetContent>
                <MetricValue>
                  <PercentageIndicator $value={performanceData.score}>{performanceData.score}%</PercentageIndicator>
                  <span style={{ fontSize: '16px', marginLeft: '10px', color: '#4caf50' }}>{performanceData.change}</span>
                </MetricValue>
                
                <h4>Problem Areas</h4>
                {performanceData.problemAreas.map((problem, index) => (
                  <ProblemItem key={problem.id}>
                    <ProblemRank>#{index + 1}</ProblemRank>
                    {problem.question} - <PercentageIndicator $value={100 - problem.incorrectRate}>{problem.incorrectRate}%</PercentageIndicator> incorrect
                  </ProblemItem>
                ))}
              </WidgetContent>
            </Widget>
          </WidgetRow>

          {/* Row 2: Word Analytics full width */}
          <Widget>
            <WidgetHeader>
              <FaCommentDots />
              <h3>Word Analytics</h3>
            </WidgetHeader>
            <WidgetContent>
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={wordAnalyticsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {wordAnalyticsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={wordAnalyticsFormatter} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <h4>Word Breakdown</h4>
                  <div style={{ marginBottom: '10px' }}>
                    Total Words: <strong>{wordAnalyticsData.reduce((acc, curr) => acc + curr.value, 0)}</strong>
                  </div>
                  {wordAnalyticsData.map((item, index) => (
                    <div key={index} style={{ 
                      margin: '10px 0', 
                      padding: '12px', 
                      borderRadius: '4px', 
                      background: COLORS[index % COLORS.length] + '22', 
                      borderLeft: `4px solid ${COLORS[index % COLORS.length]}`,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <strong>{item.name}:</strong> 
                      <span>{item.value} words ({((item.value / wordAnalyticsData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </WidgetContent>
          </Widget>

          {/* Row 3: Learning Progress full width */}
          <Widget>
            <WidgetHeader>
              <FaExclamationTriangle />
              <h3>Learning Progress</h3>
            </WidgetHeader>
            <WidgetContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={learningProgressData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={learningProgressFormatter} />
                  <Legend />
                  <Bar dataKey="mastered" fill="#82ca9d" name="Mastered %" stackId="a" />
                  <Bar dataKey="struggling" fill="#ff8042" name="Needs Help %" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </WidgetContent>
          </Widget>
        </AnalyticsGrid>
      </AnalyticsPageContainer>
    </EnhancedNavPage>
  );
}

export default TeacherAnalytics;