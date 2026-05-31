'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Users,
  Shield,
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
  Crown,
  UserCog,
  Eye,
  CheckCircle2,
  Clock,
  ChevronDown,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface TeamMember {
  id: string
  userId: string
  role: string
  invitedAt: string
  acceptedAt: string | null
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

interface MerchantData {
  merchant: {
    id: string
    businessName: string
    users: TeamMember[]
  }
}

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  owner: { label: 'Owner', color: 'bg-rose-100 text-rose-700', icon: <Crown className="h-3.5 w-3.5" /> },
  admin: { label: 'Admin', color: 'bg-violet-100 text-violet-700', icon: <Shield className="h-3.5 w-3.5" /> },
  editor: { label: 'Editor', color: 'bg-blue-100 text-blue-700', icon: <UserCog className="h-3.5 w-3.5" /> },
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-700', icon: <Eye className="h-3.5 w-3.5" /> },
}

const permissions = [
  { name: 'View Dashboard', owner: true, admin: true, editor: true, viewer: true },
  { name: 'Manage Products', owner: true, admin: true, editor: true, viewer: false },
  { name: 'Manage Orders', owner: true, admin: true, editor: true, viewer: false },
  { name: 'Manage Customers', owner: true, admin: true, editor: false, viewer: false },
  { name: 'View Analytics', owner: true, admin: true, editor: true, viewer: true },
  { name: 'Manage Discounts', owner: true, admin: true, editor: true, viewer: false },
  { name: 'Manage Workflows', owner: true, admin: true, editor: false, viewer: false },
  { name: 'Manage Staff', owner: true, admin: true, editor: false, viewer: false },
  { name: 'Billing Access', owner: true, admin: false, editor: false, viewer: false },
  { name: 'Store Settings', owner: true, admin: true, editor: false, viewer: false },
  { name: 'Delete Store', owner: true, admin: false, editor: false, viewer: false },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function getLastActive(acceptedAt: string | null, invitedAt: string): string {
  if (acceptedAt) {
    const diff = Date.now() - new Date(acceptedAt).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }
  return 'Pending'
}

export function StaffManagement() {
  const { selectedMerchantId } = useAppStore()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)

  // Form state
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState('editor')

  const fetchTeam = async () => {
    if (!selectedMerchantId) return
    setLoading(true)
    try {
      const data = await api.get<MerchantData>(`/merchants/${selectedMerchantId}`)
      setMembers(data.merchant.users || [])
    } catch {
      toast.error('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [selectedMerchantId])

  const handleInvite = async () => {
    if (!formEmail || !selectedMerchantId) {
      toast.error('Please enter an email address')
      return
    }
    setSaving(true)
    try {
      // In a real app, this would send an invite email
      // For now, we simulate by adding to the team
      const newMember: TeamMember = {
        id: `mu-${Date.now()}`,
        userId: `user-${Date.now()}`,
        role: formRole,
        invitedAt: new Date().toISOString(),
        acceptedAt: null,
        user: {
          id: `user-${Date.now()}`,
          name: formEmail.split('@')[0],
          email: formEmail,
          image: null,
        },
      }
      setMembers(prev => [...prev, newMember])
      toast.success(`Invitation sent to ${formEmail}`)
      setInviteOpen(false)
      resetForm()
    } catch {
      toast.error('Failed to send invitation')
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (member: TeamMember, newRole: string) => {
    try {
      await api.put(`/merchants/${selectedMerchantId}/users/${member.id}`, { role: newRole })
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: newRole } : m))
      toast.success(`Role updated to ${roleConfig[newRole]?.label || newRole}`)
    } catch {
      toast.error('Failed to update role')
    }
  }

  const handleRemove = async () => {
    if (!selectedMember) return
    setSaving(true)
    try {
      await api.delete(`/merchants/${selectedMerchantId}/users/${selectedMember.id}`)
      setMembers(prev => prev.filter(m => m.id !== selectedMember.id))
      toast.success('Member removed from team')
      setRemoveOpen(false)
      setSelectedMember(null)
    } catch {
      toast.error('Failed to remove member')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormEmail('')
    setFormRole('editor')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Staff & Team</h2>
          <p className="text-sm text-muted-foreground">Manage team members and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPermissions(!showPermissions)}>
            <Shield className="mr-2 h-4 w-4" />
            {showPermissions ? 'Hide Permissions' : 'Permissions Matrix'}
          </Button>
          <Button onClick={() => { resetForm(); setInviteOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold">{members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Owners</p>
            <p className="text-2xl font-bold text-rose-600">{members.filter(m => m.role === 'owner').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-violet-600">{members.filter(m => m.role === 'admin').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Invites</p>
            <p className="text-2xl font-bold text-amber-600">{members.filter(m => !m.acceptedAt).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Matrix */}
      {showPermissions && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>What each role can do in your store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Permission</TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Crown className="h-4 w-4 text-rose-600" />
                          <span className="text-xs">Owner</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Shield className="h-4 w-4 text-violet-600" />
                          <span className="text-xs">Admin</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <UserCog className="h-4 w-4 text-blue-600" />
                          <span className="text-xs">Editor</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Eye className="h-4 w-4 text-gray-600" />
                          <span className="text-xs">Viewer</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map(perm => (
                      <TableRow key={perm.name}>
                        <TableCell className="font-medium">{perm.name}</TableCell>
                        <TableCell className="text-center">
                          {perm.owner ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.admin ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.editor ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.viewer ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Team Members List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">No team members yet</p>
          <p className="text-sm text-muted-foreground mb-4">Invite team members to help manage your store</p>
          <Button onClick={() => { resetForm(); setInviteOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Invite your first member
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member, index) => {
            const role = roleConfig[member.role] || roleConfig.viewer
            const isActive = !!member.acceptedAt

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {getInitials(member.user.name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{member.user.name}</h3>
                            {isActive ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{member.user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Last active: {getLastActive(member.acceptedAt, member.invitedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Role Badge or Selector */}
                        {member.role === 'owner' ? (
                          <Badge className={role.color}>
                            {role.icon}
                            <span className="ml-1">{role.label}</span>
                          </Badge>
                        ) : (
                          <Select
                            value={member.role}
                            onValueChange={(v) => handleRoleChange(member, v)}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-1.5">
                                  <Shield className="h-3 w-3" /> Admin
                                </div>
                              </SelectItem>
                              <SelectItem value="editor">
                                <div className="flex items-center gap-1.5">
                                  <UserCog className="h-3 w-3" /> Editor
                                </div>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-1.5">
                                  <Eye className="h-3 w-3" /> Viewer
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        <Badge variant={isActive ? 'secondary' : 'outline'} className={isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                          {isActive ? 'Active' : 'Pending'}
                        </Badge>

                        {member.role !== 'owner' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedMember(member)
                                setRemoveOpen(true)
                              }} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-violet-600" />
                      <div>
                        <p className="font-medium">Admin</p>
                        <p className="text-xs text-muted-foreground">Full access except billing</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Editor</p>
                        <p className="text-xs text-muted-foreground">Manage products, orders, discounts</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-medium">Viewer</p>
                        <p className="text-xs text-muted-foreground">Read-only access to dashboard</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={saving}>
              {saving ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{selectedMember?.user.name}&quot; from the team? They will lose access to all store resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
