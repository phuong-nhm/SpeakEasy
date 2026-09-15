using EnglishLearningApp.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace EnglishLearningApp.Permissions
{
    public class EnglishLearningAppPermissionDefinitionProvider : PermissionDefinitionProvider
    {
        public override void Define(IPermissionDefinitionContext context)
        {
            var group = context.AddGroup(
                EnglishLearningAppPermissions.GroupName,
                L("Permission:EnglishLearningApp"));

            var contentManagement = group.AddPermission(
                EnglishLearningAppPermissions.ContentManagement.Default,
                L("Permission:ContentManagement"));

            contentManagement.AddChild(
                EnglishLearningAppPermissions.ContentManagement.Create,
                L("Permission:Create"));

            contentManagement.AddChild(
                EnglishLearningAppPermissions.ContentManagement.Update,
                L("Permission:Update"));

            contentManagement.AddChild(
                EnglishLearningAppPermissions.ContentManagement.Delete,
                L("Permission:Delete"));
            contentManagement.AddChild(
    EnglishLearningAppPermissions.ContentManagement.View,
    L("Permission:View"));
        }

        private static LocalizableString L(string name)
        {
            return LocalizableString.Create<EnglishLearningAppResource>(name);
        }
    }
}
