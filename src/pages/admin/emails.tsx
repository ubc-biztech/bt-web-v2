import { useState, useEffect } from "react";
import { fetchBackend } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus, Pencil, Trash2, Eye, X } from "lucide-react";

interface EmailTemplate {
  TemplateName: string;
  CreatedTimestamp?: string;
  LastModifiedTimestamp?: string;
}

interface TemplateContent {
  Subject: string;
  Html: string;
  Text?: string;
  TextPart?: string;
}

export default function EmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [templateContent, setTemplateContent] =
    useState<TemplateContent | null>(null);
  const [formData, setFormData] = useState({
    templateName: "",
    subject: "",
    html: "",
    text: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchBackend({
        endpoint: "/emails/templates",
        method: "GET",
      });
      setTemplates(data.emailTemplates || []);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load templates:", err);
      setError(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleViewTemplate = async (template: EmailTemplate) => {
    try {
      const data = await fetchBackend({
        endpoint: `/emails/templates/${template.TemplateName}`,
        method: "GET",
      });
      setSelectedTemplate(template);
      setTemplateContent(data.Template);
      setIsViewModalOpen(true);
    } catch (err: any) {
      console.error("Failed to load template:", err);
      setError(err.message || "Failed to load template");
    }
  };

  const handleDeleteTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTemplate) return;

    try {
      setIsSubmitting(true);
      await fetchBackend({
        endpoint: `/emails/templates/${selectedTemplate.TemplateName}`,
        method: "DELETE",
      });
      setIsDeleteModalOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (err: any) {
      console.error("Failed to delete template:", err);
      setError(err.message || "Failed to delete template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({ templateName: "", subject: "", html: "", text: "" });
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (template: EmailTemplate) => {
    setIsEditing(true);
    setSelectedTemplate(template);
    try {
      const data = await fetchBackend({
        endpoint: `/emails/templates/${template.TemplateName}`,
        method: "GET",
      });
      const content = data.Template;
      setFormData({
        templateName: template.TemplateName,
        subject: content.Subject || "",
        html: content.Html || "",
        text: content.Text || content.TextPart || "",
      });
      setIsModalOpen(true);
    } catch (err: any) {
      console.error("Failed to load template for edit:", err);
      setError(err.message || "Failed to load template");
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (isEditing) {
        await fetchBackend({
          endpoint: "/emails/templates/",
          method: "PATCH",
          data: formData,
        });
      } else {
        await fetchBackend({
          endpoint: "/emails/templates/",
          method: "POST",
          data: formData,
        });
      }
      setIsModalOpen(false);
      loadTemplates();
    } catch (err: any) {
      console.error("Failed to save template:", err);
      setError(err.message || "Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-bt-blue-600 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-white text-2xl font-bold">Email Templates</h2>
            <p className="text-bt-blue-100">Manage SES email templates</p>
          </div>
          <Button
            onClick={openCreateModal}
            className="bg-bt-green-500 hover:bg-bt-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Templates ({templates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : templates.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                No email templates found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.TemplateName}>
                      <TableCell className="font-medium">
                        {template.TemplateName}
                      </TableCell>
                      <TableCell>
                        {template.CreatedTimestamp
                          ? new Date(
                            template.CreatedTimestamp,
                          ).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {template.LastModifiedTimestamp
                          ? new Date(
                            template.LastModifiedTimestamp,
                          ).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTemplate(template)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(template)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Template Name
              </label>
              <Input
                value={formData.templateName}
                onChange={(e) =>
                  setFormData({ ...formData, templateName: e.target.value })
                }
                placeholder="template-name"
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                HTML Content
              </label>
              <Textarea
                value={formData.html}
                onChange={(e) =>
                  setFormData({ ...formData, html: e.target.value })
                }
                placeholder="<html>...</html>"
                rows={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Text Content
              </label>
              <Textarea
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                placeholder="Plain text content"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !formData.templateName ||
                !formData.subject ||
                !formData.html ||
                !formData.text
              }
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              View Template: {selectedTemplate?.TemplateName}
            </DialogTitle>
          </DialogHeader>
          {templateContent && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <p className="p-2 bg-gray-100 rounded">
                  {templateContent.Subject}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  HTML Content
                </label>
                <pre className="p-2 bg-gray-100 rounded overflow-x-auto text-sm whitespace-pre-wrap">
                  {templateContent.Html}
                </pre>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Text Content
                </label>
                <pre className="p-2 bg-gray-100 rounded overflow-x-auto text-sm whitespace-pre-wrap">
                  {templateContent.Text || templateContent.TextPart || "N/A"}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the template{" "}
            <strong>{selectedTemplate?.TemplateName}</strong>? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
