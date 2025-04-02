import React, { useState, ReactNode } from 'react';
import { TabContainer, Tab, TabContent } from '../styles/components/TabSelectStyles';

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabSelectProps {
  tabs: TabItem[];
  initialTabId?: string;
  onChange?: (tabId: string) => void;
}

const TabSelect: React.FC<TabSelectProps> = ({ 
  tabs, 
  initialTabId,
  onChange
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTabId || tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div>
      <TabContainer>
        {tabs.map(tab => (
          <Tab 
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabContainer>
      <TabContent>
        {activeTabContent}
      </TabContent>
    </div>
  );
};

export default TabSelect; 