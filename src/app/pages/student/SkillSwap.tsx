import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Repeat, Search, Code, Palette, Music, Globe, Camera, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface SkillPost {
  id: number;
  user: {
    name: string;
    avatar: string;
    email: string;
  };
  skillOffered: string;
  skillWanted: string;
  description: string;
  tags: string[];
}

export const SkillSwap: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const skillPosts: SkillPost[] = [
    {
      id: 1,
      user: {
        name: 'Alex Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        email: 'alex@example.com'
      },
      skillOffered: 'Web Development',
      skillWanted: 'Graphic Design',
      description: 'Experienced in React, Node.js. Looking to learn Figma and design principles.',
      tags: ['React', 'Node.js', 'JavaScript']
    },
    {
      id: 2,
      user: {
        name: 'Sarah Williams',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        email: 'sarah@example.com'
      },
      skillOffered: 'UI/UX Design',
      skillWanted: 'Frontend Development',
      description: 'Expert in Figma, Adobe XD. Want to learn React and TypeScript.',
      tags: ['Figma', 'Adobe XD', 'Design']
    },
    {
      id: 3,
      user: {
        name: 'Mike Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        email: 'mike@example.com'
      },
      skillOffered: 'Python & ML',
      skillWanted: 'Mobile App Development',
      description: 'Proficient in Python, TensorFlow. Looking to learn React Native or Flutter.',
      tags: ['Python', 'ML', 'TensorFlow']
    },
    {
      id: 4,
      user: {
        name: 'Emma Davis',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
        email: 'emma@example.com'
      },
      skillOffered: 'Content Writing',
      skillWanted: 'Video Editing',
      description: 'Professional content writer. Want to learn Premiere Pro and After Effects.',
      tags: ['Writing', 'SEO', 'Content']
    },
    {
      id: 5,
      user: {
        name: 'David Kumar',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        email: 'david@example.com'
      },
      skillOffered: 'Data Analysis',
      skillWanted: 'Backend Development',
      description: 'Excel, SQL, Power BI expert. Looking to learn Node.js and databases.',
      tags: ['Excel', 'SQL', 'Analytics']
    },
    {
      id: 6,
      user: {
        name: 'Lisa Anderson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
        email: 'lisa@example.com'
      },
      skillOffered: 'Photography',
      skillWanted: 'Social Media Marketing',
      description: 'Professional photographer. Want to learn Instagram and TikTok growth strategies.',
      tags: ['Photography', 'Lightroom', 'Photoshop']
    }
  ];

  const filteredPosts = skillPosts.filter(post =>
    post.skillOffered.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.skillWanted.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSkillIcon = (skill: string) => {
    const lowerSkill = skill.toLowerCase();
    if (lowerSkill.includes('web') || lowerSkill.includes('development')) return Code;
    if (lowerSkill.includes('design') || lowerSkill.includes('ui')) return Palette;
    if (lowerSkill.includes('music')) return Music;
    if (lowerSkill.includes('photo')) return Camera;
    if (lowerSkill.includes('writing') || lowerSkill.includes('content')) return BookOpen;
    return Globe;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Repeat className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Skill Swap</h1>
          <p className="text-muted-foreground">
            Exchange your skills with fellow students
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by skill or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{skillPosts.length}</p>
              </div>
              <Repeat className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Swappers</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Code className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Skills Available</p>
                <p className="text-2xl font-bold">42</p>
              </div>
              <Palette className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredPosts.map((post, index) => {
          const OfferedIcon = getSkillIcon(post.skillOffered);
          const WantedIcon = getSkillIcon(post.skillWanted);

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={post.user.avatar} alt={post.user.name} />
                      <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{post.user.name}</CardTitle>
                      <CardDescription className="text-xs">{post.user.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Skills Exchange */}
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10">
                      <OfferedIcon className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {post.skillOffered}
                      </span>
                    </div>
                    <Repeat className="h-5 w-5 text-muted-foreground" />
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10">
                      <WantedIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {post.skillWanted}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">{post.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button className="w-full" variant="outline">
                    <Repeat className="mr-2 h-4 w-4" />
                    Connect & Swap
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No skill posts found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
