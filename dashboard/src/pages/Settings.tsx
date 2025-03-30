import NavPage from '../components/NavPage';
import TabSelect from '../components/TabSelect';
import TeacherSettings from '../components/settings/TeacherSettings';
// import OrganizationSettings from '../components/settings/OrganizationSettings';
import { ContentContainer, Title } from '../styles/components/SettingsPageStyles';

function Settings() {
  const settingsTabs = [
    {
      id: 'teacher',
      label: 'Teacher',
      content: <TeacherSettings />
    },
    // {
    //   id: 'organization',
    //   label: 'Organization',
    //   content: <OrganizationSettings />
    // }
  ];

  return (
    <NavPage>
      <ContentContainer>
        <Title>Settings</Title>
        <TabSelect tabs={settingsTabs} initialTabId="teacher" />
      </ContentContainer>
    </NavPage>
  );
}

export default Settings; 