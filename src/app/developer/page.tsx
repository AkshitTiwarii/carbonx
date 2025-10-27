"use client";

import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ExternalLink, GitBranch, Star, Users, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  updated_at: string;
}

interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string;
  html_url: string;
}

interface ContributionData {
  date: string;
  count: number;
}

export default function Page() {
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGitHubData();
  }, []);

  const fetchGitHubData = async () => {
    try {
      setLoading(true);
      
      // Fetch user data via our server proxy to avoid client-side rate limits/CORS issues.
      const userResponse = await fetch('/api/github/user', { cache: 'no-cache' });
      if (!userResponse.ok) {
        console.error('GitHub user proxy returned', userResponse.status);
        setUserData(null);
      } else {
        const user = await userResponse.json();
        setUserData(user);
      }

      // Fetch repos via server proxy (preserves query options)
      const reposResponse = await fetch('/api/github/repos?sort=updated&per_page=6', { cache: 'no-cache' });
      if (!reposResponse.ok) {
        console.error('GitHub repos proxy returned', reposResponse.status);
        setRepos([]);
      } else {
        const reposData = await reposResponse.json();
        setRepos(reposData);
      }

      // Generate contribution data for a proper grid (53 weeks × 7 days)
      const contributionData = generateContributionGrid();
      setContributions(contributionData);

    } catch (error) {
      console.error('Error fetching GitHub data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContributionGrid = () => {
    const contributions = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // Go back 52 weeks
    
    // Generate exactly 371 days (53 weeks × 7 days) for proper grid
    for (let i = 0; i < 371; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      contributions.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5)
      });
    }
    return contributions;
  };

  const getContributionColor = (count: number) => {
    if (count === 0) return 'bg-zinc-200 dark:bg-zinc-800';
    if (count <= 1) return 'bg-green-200 dark:bg-green-900';
    if (count <= 2) return 'bg-green-300 dark:bg-green-700';
    if (count <= 3) return 'bg-green-400 dark:bg-green-600';
    return 'bg-green-500 dark:bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Developer Hub
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-6">
            Meet the developer behind CarbonX and explore the technical foundation of sustainable technology
          </p>
          <button
            onClick={fetchGitHubData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh GitHub Data'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Developer Profile */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-8">
                {userData && (
                  <>
                    <div className="text-center mb-6">
                      <img
                        src={userData.avatar_url}
                        alt={userData.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-green-500"
                      />
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {userData.name || 'Akshit Tiwari'}
                      </h2>
                      <p className="text-zinc-600 dark:text-zinc-400">@{userData.login}</p>
                      {userData.bio && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">{userData.bio}</p>
                      )}
                      {userData.location && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">📍 {userData.location}</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{userData.public_repos}</div>
                        <div className="text-xs text-zinc-500">Repositories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{userData.followers}</div>
                        <div className="text-xs text-zinc-500">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{userData.following}</div>
                        <div className="text-xs text-zinc-500">Following</div>
                      </div>
                    </div>

                    {/* Contact Links */}
                    <div className="space-y-3">
                      <Link
                        href="https://github.com/AkshitTiwarii"
                        target="_blank"
                        className="flex items-center gap-3 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Github className="w-5 h-5" />
                        <span className="font-medium">GitHub</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </Link>
                      <Link
                        href="https://www.linkedin.com/in/akshit-tiwarii/"
                        target="_blank"
                        className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-blue-700 dark:text-blue-300"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="font-medium">LinkedIn</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </Link>
                      <Link
                        href="mailto:akshittiwari29@gmail.com"
                        className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-green-700 dark:text-green-300"
                      >
                        <Mail className="w-5 h-5" />
                        <span className="font-medium">Email</span>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contribution Graph */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Contribution Activity
                </h3>
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-[800px]">
                    <div className="grid grid-rows-7 grid-flow-col gap-1 h-28">
                      {contributions.map((contribution, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-sm ${getContributionColor(contribution.count)}`}
                          title={`${contribution.date}: ${contribution.count} contributions`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-zinc-500">
                      <span>Less</span>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-zinc-200 dark:bg-zinc-800"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500"></div>
                      </div>
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Repositories */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Recent Repositories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repos.map((repo) => (
                    <div key={repo.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {repo.name}
                        </h4>
                        <Link href={repo.html_url} target="_blank" className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                      {repo.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {repo.forks_count}
                          </span>
                        </div>
                        <span>
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* About CarbonX Development */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                  About CarbonX Development
                </h3>
                <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
                  <p>
                    CarbonX is built with cutting-edge web technologies to deliver a seamless experience for carbon credit trading and sustainability tracking.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg">
                      <div className="text-2xl mb-1">⚛️</div>
                      <div className="text-sm font-medium">React 18</div>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg">
                      <div className="text-2xl mb-1">🔺</div>
                      <div className="text-sm font-medium">Next.js 14</div>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg">
                      <div className="text-2xl mb-1">🎨</div>
                      <div className="text-sm font-medium">Tailwind CSS</div>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-zinc-800 rounded-lg">
                      <div className="text-2xl mb-1">🤖</div>
                      <div className="text-sm font-medium">AI Integration</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
