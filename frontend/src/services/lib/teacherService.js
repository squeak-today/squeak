import supabase from '../../lib/supabase';

const apiBase = process.env.REACT_APP_API_BASE;

export const teacherService = {
  async verifyTeacher() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');
    
    const res = await fetch(`${apiBase}teacher`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    return res.json();
  },

  async getClassroomInfo() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const res = await fetch(`${apiBase}teacher/classroom`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch classroom info');
    return res.json();
  },

  async fetchContent({ language, cefr, subject, page, pagesize, whitelist }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const queryParams = new URLSearchParams({ 
      language, 
      cefr, 
      subject, 
      page, 
      pagesize,
      whitelist,
      content_type: 'All'
    }).toString();

    const res = await fetch(`${apiBase}teacher/classroom/content?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });

    if (!res.ok) throw new Error('Failed to fetch content');
    return res.json();
  },

  async acceptContent(story) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const res = await fetch(`${apiBase}teacher/classroom/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ 
        content_type: story.content_type, 
        content_id: parseInt(story.id, 10)
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to accept content');
    }
    return res.json();
  },

  async rejectContent(story) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session found');

    const res = await fetch(`${apiBase}teacher/classroom/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ 
        content_type: story.content_type, 
        content_id: parseInt(story.id, 10)
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to reject content');
    }
    return res.json();
  }
}; 