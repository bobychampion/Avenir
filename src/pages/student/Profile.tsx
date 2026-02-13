import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { AppShell } from '../../components/layout';
import { Button, Card, Input, LinkButton, SectionTitle, Select } from '../../components/ui';
import { getCurrentStudent, signOutStudent } from '../../lib/studentAuth';
import {
  createSchool,
  getStudentProfile,
  isProfileComplete,
  listSchools,
  upsertStudentProfile,
  type School,
  type StudentProfile
} from '../../lib/studentProfile';
import { listReports } from '../../lib/reportStore';
import { getPublishedConfig } from '../../lib/config';
import type { ConfigSnapshot, Report } from '../../lib/types';

const classLevels = ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];

const buildAvatarUrl = (seed: string) =>
  `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;

const toCsv = (items?: string[] | null) => (items && items.length > 0 ? items.join(', ') : '');
const fromCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolMode, setSchoolMode] = useState<'existing' | 'new'>('existing');
  const [schoolId, setSchoolId] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('');
  const [newSchoolState, setNewSchoolState] = useState('');
  const [newSchoolCountry, setNewSchoolCountry] = useState('Nigeria');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    age: '',
    classLevel: '',
    favoriteColor: '',
    favoriteFood: '',
    hobbies: '',
    interests: '',
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianRelationship: '',
    guardianPermission: false
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentStudent();
      if (!user) {
        navigate('/student/login');
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? '');

      const [profileData, schoolList] = await Promise.all([
        getStudentProfile(user.id),
        listSchools()
      ]);
      setSchools(schoolList);
      setProfile(profileData);

      if (profileData) {
        setForm({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          age: profileData.age ? String(profileData.age) : '',
          classLevel: profileData.class_level || '',
          favoriteColor: profileData.favorite_color || '',
          favoriteFood: profileData.favorite_food || '',
          hobbies: toCsv(profileData.hobbies),
          interests: toCsv(profileData.interests),
          guardianName: profileData.guardian_name || '',
          guardianEmail: profileData.guardian_email || '',
          guardianPhone: profileData.guardian_phone || '',
          guardianRelationship: profileData.guardian_relationship || '',
          guardianPermission: Boolean(profileData.guardian_permission)
        });

        if (profileData.school_id) {
          setSchoolMode('existing');
          setSchoolId(profileData.school_id);
        } else if (profileData.school_name) {
          setSchoolMode('new');
          setNewSchoolName(profileData.school_name);
        }

        setAvatarUrl(profileData.avatar_url || buildAvatarUrl(profileData.first_name || user.id));
      } else {
        setAvatarUrl(buildAvatarUrl(user.id));
      }

      const [history, published] = await Promise.all([
        listReports(user.id),
        getPublishedConfig()
      ]);
      setReports(history);
      setConfig(published);
    };

    load();
  }, [navigate]);

  const selectedSchool = useMemo(
    () => schools.find((school) => school.id === schoolId) || null,
    [schools, schoolId]
  );

  const profileComplete = useMemo(() => isProfileComplete(profile), [profile]);

  const handleAvatarShuffle = () => {
    setAvatarUrl(buildAvatarUrl(nanoid(12)));
  };

  const handleSave = async () => {
    setMessage('');
    setError('');

    if (!userId) {
      setError('Please sign in to save your profile.');
      return;
    }

    if (!form.firstName.trim()) {
      setError('First name is required.');
      return;
    }

    setSaving(true);

    let finalSchoolId = schoolId;
    let finalSchoolName = selectedSchool?.name || '';

    if (schoolMode === 'new') {
      if (!newSchoolName.trim()) {
        setError('Enter your school name or select from the list.');
        setSaving(false);
        return;
      }
      const created = await createSchool({
        name: newSchoolName.trim(),
        city: newSchoolCity.trim() || null,
        state: newSchoolState.trim() || null,
        country: newSchoolCountry.trim() || null
      });
      if (created) {
        finalSchoolId = created.id;
        finalSchoolName = created.name;
        const updatedSchools = await listSchools();
        setSchools(updatedSchools);
        setSchoolMode('existing');
        setSchoolId(created.id);
      } else {
        finalSchoolName = newSchoolName.trim();
      }
    } else if (!finalSchoolId) {
      setError('Select a school or add a new one.');
      setSaving(false);
      return;
    }

    const payload: StudentProfile = {
      id: userId,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim() || null,
      email: email || null,
      phone: form.phone.trim() || null,
      avatar_url: avatarUrl || null,
      school_id: finalSchoolId || null,
      school_name: finalSchoolName || null,
      location: form.location.trim() || null,
      age: form.age ? Number(form.age) : null,
      class_level: form.classLevel || null,
      favorite_color: form.favoriteColor.trim() || null,
      favorite_food: form.favoriteFood.trim() || null,
      hobbies: fromCsv(form.hobbies),
      interests: fromCsv(form.interests),
      guardian_name: form.guardianName.trim() || null,
      guardian_email: form.guardianEmail.trim() || null,
      guardian_phone: form.guardianPhone.trim() || null,
      guardian_relationship: form.guardianRelationship.trim() || null,
      guardian_permission: form.guardianPermission,
      updated_at: new Date().toISOString()
    };

    const saved = await upsertStudentProfile(payload);

    if (!saved) {
      setError('Could not save your profile. Try again.');
      setSaving(false);
      return;
    }

    setProfile(saved);
    setMessage('Profile saved successfully.');
    setSaving(false);
  };

  const clusterLabel = (clusterId: string) =>
    config?.clusters.find((cluster) => cluster.id === clusterId)?.label || clusterId;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <SectionTitle
          title="Student profile"
          subtitle="Add your basic details now, and personalize more when you are ready."
        />

        <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
          <Card className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-3xl bg-slate-100 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Avatar</div>
                <div className="text-lg font-bold text-dark">{form.firstName || 'New student'}</div>
                <Button variant="outline" className="mt-3 !px-4 !py-2 text-xs" onClick={handleAvatarShuffle}>
                  Randomize avatar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Account</div>
              <div className="text-sm text-slate-600">{email || 'No email detected'}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Profile status</div>
              <div className={`text-sm font-semibold ${profileComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                {profileComplete ? 'Profile complete' : 'Basic profile needed'}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <LinkButton to="/student" variant="outline" className="!px-4 !py-2 text-xs">
                Back to dashboard
              </LinkButton>
              <Button
                variant="ghost"
                className="!px-4 !py-2 text-xs"
                onClick={async () => {
                  await signOutStudent();
                  navigate('/student/login');
                }}
              >
                Sign out
              </Button>
            </div>
          </Card>

          <Card className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">First name</label>
                <Input
                  value={form.firstName}
                  onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Last name</label>
                <Input
                  value={form.lastName}
                  onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">School</label>
                <Select
                  value={schoolMode === 'existing' ? schoolId : '__new__'}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === '__new__') {
                      setSchoolMode('new');
                      setSchoolId('');
                    } else {
                      setSchoolMode('existing');
                      setSchoolId(value);
                    }
                  }}
                >
                  <option value="">Select a school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                  <option value="__new__">Add a new school…</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Class</label>
                <Select
                  value={form.classLevel}
                  onChange={(event) => setForm((prev) => ({ ...prev, classLevel: event.target.value }))}
                >
                  <option value="">Select class</option>
                  {classLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {schoolMode === 'new' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">New school name</label>
                  <Input
                    value={newSchoolName}
                    onChange={(event) => setNewSchoolName(event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">School city</label>
                  <Input
                    value={newSchoolCity}
                    onChange={(event) => setNewSchoolCity(event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">School state</label>
                  <Input
                    value={newSchoolState}
                    onChange={(event) => setNewSchoolState(event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Country</label>
                  <Input
                    value={newSchoolCountry}
                    onChange={(event) => setNewSchoolCountry(event.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Age</label>
                <Input
                  type="number"
                  min={5}
                  max={25}
                  value={form.age}
                  onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Location</label>
                <Input
                  placeholder="City or state"
                  value={form.location}
                  onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone</label>
                <Input
                  placeholder="Optional"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Favorite color</label>
                <Input
                  value={form.favoriteColor}
                  onChange={(event) => setForm((prev) => ({ ...prev, favoriteColor: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Favorite food</label>
                <Input
                  value={form.favoriteFood}
                  onChange={(event) => setForm((prev) => ({ ...prev, favoriteFood: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Hobbies</label>
                <Input
                  placeholder="e.g. music, football, reading"
                  value={form.hobbies}
                  onChange={(event) => setForm((prev) => ({ ...prev, hobbies: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Interests</label>
                <Input
                  placeholder="e.g. science, art, technology"
                  value={form.interests}
                  onChange={(event) => setForm((prev) => ({ ...prev, interests: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Guardian name</label>
                <Input
                  value={form.guardianName}
                  onChange={(event) => setForm((prev) => ({ ...prev, guardianName: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Relationship</label>
                <Input
                  placeholder="Parent, guardian"
                  value={form.guardianRelationship}
                  onChange={(event) => setForm((prev) => ({ ...prev, guardianRelationship: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Guardian email</label>
                <Input
                  value={form.guardianEmail}
                  onChange={(event) => setForm((prev) => ({ ...prev, guardianEmail: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Guardian phone</label>
                <Input
                  value={form.guardianPhone}
                  onChange={(event) => setForm((prev) => ({ ...prev, guardianPhone: event.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.guardianPermission}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, guardianPermission: event.target.checked }))
                  }
                />
                Guardian permission received
              </label>
            </div>

            {error ? <div className="text-sm text-red-500 font-semibold">{error}</div> : null}
            {message ? <div className="text-sm text-emerald-600 font-semibold">{message}</div> : null}

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save profile'}
              </Button>
              {profileComplete ? (
                <LinkButton to="/student/onboarding" variant="outline" className="!px-4 !py-2 text-xs">
                  Start assessment
                </LinkButton>
              ) : (
                <Button variant="outline" className="!px-4 !py-2 text-xs" disabled>
                  Complete profile to start
                </Button>
              )}
            </div>
          </Card>
        </div>

        <Card className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Assessment history</div>
          {reports.length === 0 ? (
            <div className="text-sm text-slate-500">No assessments yet. Start a new one when you are ready.</div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 6).map((report) => (
                <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-700">
                      {clusterLabel(report.result_json.primary_cluster)}
                    </div>
                    <div className="text-xs text-slate-500">{new Date(report.created_at).toLocaleString()}</div>
                  </div>
                  <LinkButton
                    to={`/student/results/${report.session_id}`}
                    variant="outline"
                    className="!px-4 !py-2 text-xs"
                  >
                    View results
                  </LinkButton>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
