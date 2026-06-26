import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { User, Mail, GraduationCap, School, Target } from 'lucide-react';
import './Auth.css';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [major, setMajor] = useState(user?.major || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [studyGoal, setStudyGoal] = useState(user?.studyGoal || 15);

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Validation Error', 'Name cannot be empty', 'warning');
      return;
    }

    const res = updateProfile({
      name,
      major,
      university,
      studyGoal: parseInt(studyGoal, 10) || 15
    });

    if (res.success) {
      setIsEditing(false);
      addToast('Profile Updated', 'Your profile details have been saved successfully.', 'success');
    }
  };

  if (!user) return <p className="text-center p-4">Please log in to view your profile.</p>;

  return (
    <div className="profile-container">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>My Profile</h2>
      
      <Card className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar-wrapper">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-avatar" />
            ) : (
              <User size={48} className="profile-avatar-placeholder" />
            )}
          </div>
          <div className="profile-meta">
            <h3 className="profile-name">{user.name}</h3>
            <p className="text-sm text-muted">{user.email}</p>
            <span className="profile-tag">{user.major || 'Undecided'}</span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="profile-details-grid">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email (Not editable)"
                value={user.email}
                disabled
              />
              <Input
                label="Major / Course"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
              <Input
                label="University / Institution"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
              <Input
                label="Weekly Study Goal (Hours)"
                type="number"
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
                min="1"
                max="168"
              />
            </div>
            
            <div className="flex gap-4 mt-4" style={{ justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="profile-details-grid">
              <div className="flex items-center gap-4 p-4" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <Mail size={20} color="var(--color-primary)" />
                <div>
                  <div className="text-xs text-muted font-semibold">EMAIL</div>
                  <div className="text-sm font-medium">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <GraduationCap size={20} color="var(--color-primary)" />
                <div>
                  <div className="text-xs text-muted font-semibold">MAJOR</div>
                  <div className="text-sm font-medium">{user.major || 'Not set'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <School size={20} color="var(--color-primary)" />
                <div>
                  <div className="text-xs text-muted font-semibold">UNIVERSITY</div>
                  <div className="text-sm font-medium">{user.university || 'Not set'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <Target size={20} color="var(--color-primary)" />
                <div>
                  <div className="text-xs text-muted font-semibold">WEEKLY STUDY GOAL</div>
                  <div className="text-sm font-medium">{user.studyGoal || 0} Hours</div>
                </div>
              </div>
            </div>

            <div className="flex mt-4" style={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Profile;
