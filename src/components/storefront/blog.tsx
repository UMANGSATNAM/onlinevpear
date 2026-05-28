'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Calendar,
  User,
  ArrowRight,
  Tag,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  coverImage?: string | null
  author?: string | null
  tags?: string
  status: string
  publishedAt?: string | null
  createdAt: string
}

const blogGradients = [
  'from-rose-400 to-pink-300',
  'from-violet-400 to-purple-300',
  'from-emerald-400 to-teal-300',
  'from-amber-400 to-orange-300',
  'from-sky-400 to-cyan-300',
  'from-fuchsia-400 to-pink-300',
]

export function BlogPage() {
  const { selectedStoreId } = useAppStore()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const storeId = sessionStorage.getItem('shopforge_store_id') || selectedStoreId
        if (!storeId) {
          setLoading(false)
          return
        }
        const res = await fetch(`/api/blogs?storeId=${storeId}&status=published&limit=50`)
        if (res.ok) {
          const data = await res.json()
          const publishedPosts = data.blogs || []
          setPosts(publishedPosts)

          // Extract all tags
          const tags = new Set<string>()
          publishedPosts.forEach((post: BlogPost) => {
            if (post.tags) {
              try {
                const parsed = JSON.parse(post.tags)
                if (Array.isArray(parsed)) parsed.forEach((t: string) => tags.add(t))
              } catch {
                // ignore
              }
            }
          })
          setAllTags(Array.from(tags))
        }
      } catch (err) {
        console.error('Failed to fetch blogs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [selectedStoreId])

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!post.title.toLowerCase().includes(q) && !(post.excerpt || '').toLowerCase().includes(q)) {
        return false
      }
    }
    if (selectedTag) {
      try {
        const tags = JSON.parse(post.tags || '[]')
        if (!tags.includes(selectedTag)) return false
      } catch {
        return false
      }
    }
    return true
  })

  const featuredPost = filteredPosts[0]
  const remainingPosts = filteredPosts.slice(1)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-80 rounded-xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Our Blog</h1>
        <p className="text-muted-foreground">Stay updated with the latest news, tips, and stories.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedTag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className={!selectedTag ? 'bg-rose-500 hover:bg-rose-600' : ''}
            >
              All
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={selectedTag === tag ? 'bg-rose-500 hover:bg-rose-600' : ''}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No articles found</h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery ? 'Try a different search term.' : 'Check back later for new articles.'}
          </p>
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden cursor-pointer group mb-10 border-0 shadow-sm hover:shadow-lg transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className={`aspect-video lg:aspect-auto bg-gradient-to-br ${blogGradients[0]} flex items-center justify-center`}>
                    <span className="text-white/30 text-5xl font-bold">
                      {featuredPost.title.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="text-xs">Featured</Badge>
                      {featuredPost.publishedAt && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(featuredPost.publishedAt)}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-rose-500 transition-colors">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-muted-foreground mb-4 line-clamp-3">{featuredPost.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {featuredPost.author && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {featuredPost.author}
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-rose-500">
                        Read More
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Blog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingPosts.map((post, index) => {
              const parsedTags: string[] = (() => {
                try { return JSON.parse(post.tags || '[]') } catch { return [] }
              })()

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                    <div className={`aspect-video bg-gradient-to-br ${blogGradients[(index + 1) % blogGradients.length]} flex items-center justify-center`}>
                      <span className="text-white/30 text-3xl font-bold">
                        {post.title.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        {post.publishedAt && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.publishedAt)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold mb-2 group-hover:text-rose-500 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        {parsedTags.length > 0 && (
                          <div className="flex gap-1">
                            {parsedTags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="h-2.5 w-2.5 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {post.author && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {post.author}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
